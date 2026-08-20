/**
 * ETL: nhập dữ liệu "Tin tức + Chuyên mục" và "Công văn" từ CSDL web cũ (CMS_CongDoan, SQL Server,
 * server 45.117.177.224) sang CSDL mới (CongDoanUtehy) qua Prisma.
 *
 * PHẠM VI HIỆN TẠI:
 *   - tblCategory -> Category, tblPost -> Post (tin tức/chuyên mục).
 *   - tblDocumentKind -> DocumentType ("loại công văn"), tblDocument -> OfficialDocument,
 *     tblAttach -> DocumentAttachment (2.494 công văn thật — xem chú thích đầu domain block trong
 *     prisma/schema.prisma để biết chi tiết map từng cột, đã xác nhận từ code-behind gốc
 *     web_cu/MyWeb/CV2/Document/*.aspx.cs + web_cu/MyWeb/CV2/Common/ECommon.cs, KHÔNG đoán mò).
 *   - CONGDOANBOPHAN -> UnionDepartment, NHANVIEN -> UnionMember (6 field công khai, đối chiếu trực
 *     tiếp từ sp_tblCongDoanVien_GetByAll INNER JOIN NHANVIEN/CONGDOANBOPHAN và
 *     modules/GioiThieuCongDoanVien.aspx(.cs)) + UnionMemberProfile (TOÀN BỘ phần còn lại của NHANVIEN,
 *     ~90 cột gốc — CHỈ dùng cho màn hình quản trị nội bộ, không lộ ra trang/endpoint công khai nào,
 *     xem chú thích đầu domain block UNIONDIRECTORY trong prisma/schema.prisma).
 *   - tblSlide -> HomeSlide (banner trang chủ), lọc Active=1 giống modules/uc_Slide.ascx.cs.
 *
 * KHÔNG bao gồm (xem giải thích trong chat / báo cáo khảo sát mã nguồn web cũ):
 *   - tblNguoiDung (tài khoản, 4 dòng)  — quá ít, không đáng viết ETL riêng; đăng nhập thật của web
 *     cũ dùng ASP.NET SqlMembershipProvider, không phải bảng này.
 *   - tblCongDoanVien (hồ sơ đoàn viên) — KHÔNG tồn tại trên CSDL production (đã xác nhận, không
 *     phải giả định) — không có gì để migrate. Hệ thống mới cũng chưa có domain Membership (Phase 2).
 *   - tblNoiDungCV / tblLoaiCV / tblFileDinhKem / tblPostCongVan (94/18/92/0 dòng) — đây là một bộ
 *     bảng công văn KHÁC, cũ hơn/bỏ dở, KHÔNG phải nguồn dữ liệu công văn thật (xem tblDocument ở
 *     trên, 2.494 dòng — mới là hệ đang dùng thật). Không migrate bộ bảng này.
 *   - Luồng duyệt/xử lý công văn (StartProcess/EndProcess/UserComments/UserProcess routing) — CHỦ
 *     ĐỘNG không xây lại thành tính năng, chỉ giữ các mốc thời gian liên quan làm dữ liệu tham khảo.
 *
 * File vật lý đính kèm công văn (web_cu/MyWeb/CV2/Document/DocumentFiles/{username}/...) CÓ TRONG
 * bản upload — cần copy nguyên thư mục DocumentFiles sang server mới (xem deploy guide Bước 6.5) để
 * link file trong DocumentAttachment.path hoạt động đúng.
 *
 * Cách chạy (từ server, sau khi đã prisma:generate và có DATABASE_URL trong .env):
 *   1. Thêm vào .env: LEGACY_DB_HOST / LEGACY_DB_PORT / LEGACY_DB_NAME / LEGACY_DB_USER / LEGACY_DB_PASSWORD
 *   2. Thử trước (không ghi gì vào CSDL mới, chỉ log ra sẽ làm gì):
 *        LEGACY_MIGRATE_DRY_RUN=true pnpm migrate:legacy
 *   3. Chạy thật:
 *        pnpm migrate:legacy
 * Toàn bộ 8 model (Category/Post/DocumentType/OfficialDocument/DocumentAttachment/UnionDepartment/
 * UnionMember/HomeSlide) đều tra cứu bản ghi đã nhập qua cột legacyCode (KHÔNG qua slug) trước khi
 * upsert, nên chạy lại script nhiều lần là
 * AN TOÀN (idempotent) — không tạo trùng, không đổi slug/URL đã công khai của bản ghi đã có. Trước
 * đây Category/Post tra theo slug, gây trùng dữ liệu thật trên production khi chạy ETL lần 2 (slug
 * của chính bản ghi cũ bị hiểu nhầm là "đã bị chiếm", tự thêm hậu tố "-2" rồi tạo mới) — đã sửa bằng
 * cách thêm cột legacyCode cho Category/Post giống 3 model công văn.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import sql from "mssql";
import { slugify } from "../apps/api/src/common/utils/slugify";

const prisma = new PrismaClient();

const DRY_RUN = process.env.LEGACY_MIGRATE_DRY_RUN === "true";

// Tài khoản hệ thống dùng làm "tác giả" cho toàn bộ bài viết nhập từ web cũ — không dùng để đăng
// nhập được (mật khẩu random + isActive=false), chỉ để audit log/DB tra được nguồn gốc bài viết.
const IMPORT_BOT_EMAIL = "legacy-import@congdoan.utehy.edu.vn";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu biến môi trường ${name} (CSDL web cũ) — xem hướng dẫn đầu file migrate-legacy-content.ts`);
  return v;
}

async function connectLegacyDb() {
  return sql.connect({
    server: requireEnv("LEGACY_DB_HOST"),
    port: Number(process.env.LEGACY_DB_PORT ?? 1433),
    database: requireEnv("LEGACY_DB_NAME"),
    user: requireEnv("LEGACY_DB_USER"),
    password: requireEnv("LEGACY_DB_PASSWORD"),
    options: { encrypt: false, trustServerCertificate: true },
    connectionTimeout: 15000
  });
}

/** Legacy CreateDate là string tự do (nhập từ ASP.NET, thường "dd/MM/yyyy HH:mm:ss" hoặc "MM/dd/yyyy...").
 * Thử vài định dạng phổ biến, không parse được thì trả về null (script sẽ dùng ngày hiện tại). */
function parseLegacyDate(raw: unknown): Date | null {
  const s = str(raw);
  if (!s) return null;

  // dd/MM/yyyy[ HH:mm:ss]
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmy) {
    const [, d, m, y, h = "0", mi = "0", se = "0"] = dmy;
    const dt = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(mi), Number(se));
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  // ISO hoặc định dạng Date() hiểu được sẵn
  const generic = new Date(s);
  if (!Number.isNaN(generic.getTime())) return generic;

  return null;
}

/** Bỏ thẻ HTML thô để làm excerpt ngắn từ ContentUp (không cần thư viện sanitize đầy đủ, chỉ hiển thị tóm tắt). */
function stripHtmlForExcerpt(html: unknown, maxLen = 300): string | undefined {
  const raw = str(html);
  if (!raw) return undefined;
  const text = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

/** CSDL web cũ (SQL Server) đôi khi trả cột "chắc chắn là text theo tên/theo code cũ" nhưng driver
 * mssql thực tế lại đưa về number/Date/... (gặp thật ở tblPost.Name khi chạy trên server production —
 * KHÔNG phải giả định) — có thể do stored procedure cũ CAST/UNION lệch kiểu, hoặc dữ liệu nhập tay
 * lẫn kiểu qua nhiều đời code ASP.NET. Kiểu khai báo TypeScript trên recordset chỉ là "as" (ép kiểu
 * biên dịch, KHÔNG kiểm tra runtime), nên không thể tin chắc row.X luôn đúng là string|null. Toàn bộ
 * chỗ đọc field text từ CSDL cũ phải qua hàm này thay vì gọi thẳng ".trim()"/"?.trim()" — tránh vỡ
 * giữa chừng ETL 2.494 dòng chỉ vì 1 dòng dữ liệu lạ.
 */
function str(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "string") return raw.trim();
  return String(raw).trim();
}

/** Ảnh bài viết web cũ (cột tblPost.Image) lưu đường dẫn tương đối tới gốc site, nhưng KHÔNG nhất
 * quán có dấu "/" ở đầu hay không (dữ liệu nhập qua nhiều đời CMS/người dùng khác nhau) — gặp thật:
 * phần lớn dòng có dạng "/upload/images/...", một số dòng lại thiếu dấu "/" thành "upload/images/...".
 * Thiếu "/" đầu khiến trình duyệt resolve SAI thành đường dẫn tương đối theo URL trang hiện tại (vd ở
 * trang "/tin-tuc/xyz" sẽ thành "/tin-tuc/upload/images/..." — sai, ảnh vỡ vì bị SPA fallback rewrite
 * trả về index.html) thay vì đúng theo gốc site "/upload/images/...". Chuẩn hoá luôn thêm "/" đầu nếu
 * thiếu, trừ khi đã là URL tuyệt đối (http/https) hoặc rỗng. */
function normalizeAssetPath(raw: string): string | null {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) return raw;
  return `/${raw}`;
}

/** 13 tên chuyên mục con thuộc menu "Giới thiệu" ở web cũ, chép trực tiếp từ footer sitemap của
 * https://congdoan.utehy.edu.vn/ (KHÔNG đoán) — dùng để ETL tự động gắn Category.isAboutSection=true
 * khi tên chuyên mục khớp (so khớp không phân biệt hoa/thường, bỏ khoảng trắng đầu/cuối). Admin vẫn
 * có thể bật/tắt tay sau qua trang Chuyên mục nếu web cũ đổi tên hoặc thêm chuyên mục mới không khớp
 * danh sách này. */
const ABOUT_CATEGORY_NAMES = new Set(
  [
    "Giới thiệu chung",
    "Chức năng nhiệm vụ",
    "Ban chấp hành",
    "Cơ cấu tổ chức",
    "BCH Công đoàn qua các thời kỳ",
    "Ủy ban kiểm tra",
    "Ban Tuyên giáo nữ công",
    "Ban Văn thể",
    "Ban Tài chính",
    "Ban Thanh tra nhân dân",
    "Ban Chính sách pháp luật",
    "Văn phòng",
    "Ban chuyên môn"
  ].map((n) => n.trim().toLowerCase())
);

function isAboutCategoryName(name: string): boolean {
  return ABOUT_CATEGORY_NAMES.has(name.trim().toLowerCase());
}

function uniqueSlug(base: string, used: Set<string>, legacyId: string): string {
  let candidate = base || `bai-viet-${legacyId}`;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

async function ensureImportBotUser(): Promise<string> {
  if (DRY_RUN) return "(dry-run: chưa tạo user)";
  const randomPassword = `${Math.random().toString(36)}${Date.now()}`;
  const passwordHash = await hash(randomPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: IMPORT_BOT_EMAIL },
    update: {},
    create: {
      email: IMPORT_BOT_EMAIL,
      passwordHash,
      fullName: "Nhập liệu tự động từ web cũ",
      isActive: false
    }
  });
  return user.id;
}

async function migrateCategories(pool: sql.ConnectionPool): Promise<Map<string, string>> {
  console.log("\n[1/8] Đang lấy danh sách chuyên mục (sp_tblCategory_GetByAll) từ web cũ...");
  const result = await pool.request().execute("sp_tblCategory_GetByAll");
  const rows = result.recordset as Array<{
    Id: string;
    Name: string | null;
    MetaTitle: string | null;
    MetaDescription: string | null;
    MetaKeywords: string | null;
    Active: string | null;
  }>;
  console.log(`  -> Tìm thấy ${rows.length} chuyên mục ở web cũ.`);

  const legacyToNewId = new Map<string, string>();
  const usedSlugs = new Set<string>();

  // Nạp trước slug đã tồn tại trong CSDL mới để tránh đụng độ với dữ liệu đã có (vd chuyên mục seed
  // sẵn, hoặc chuyên mục khác đã nhập trong CHÍNH lần chạy này). KHÔNG dùng để quyết định slug MỚI
  // cho một chuyên mục ĐÃ nhập ở lần chạy trước — việc đó tra theo legacyCode bên dưới, không đoán
  // qua slug (lỗi thật gặp trên production: chạy ETL lần 2 hiểu nhầm slug của chính bản ghi cũ là bị
  // "chiếm", tự thêm hậu tố "-2" và tạo trùng thay vì cập nhật).
  if (!DRY_RUN) {
    const existing = await prisma.category.findMany({ select: { slug: true } });
    existing.forEach((c) => usedSlugs.add(c.slug));
  }

  let sortOrder = 0;
  for (const row of rows) {
    const name = str(row.Name) || `Chuyên mục ${row.Id}`;
    const legacyCode = String(row.Id);

    if (DRY_RUN) {
      const slug = uniqueSlug(slugify(name), usedSlugs, row.Id);
      console.log(`  [dry-run] Category "${name}" -> slug "${slug}"`);
      legacyToNewId.set(row.Id, `dry-run-${row.Id}`);
      sortOrder += 1;
      continue;
    }

    // Đã nhập ở lần chạy trước (khớp legacyCode) -> GIỮ NGUYÊN slug hiện có (không đổi URL đã công
    // khai), chỉ tạo slug MỚI khi đây thực sự là chuyên mục chưa từng nhập.
    const existingCategory = await prisma.category.findFirst({ where: { legacyCode } });
    const slug = existingCategory ? existingCategory.slug : uniqueSlug(slugify(name), usedSlugs, row.Id);

    const category = await upsertByLegacyCode(prisma.category, legacyCode, {
      slug,
      name,
      description: str(row.MetaDescription) || null,
      sortOrder,
      isAboutSection: isAboutCategoryName(name)
    });
    legacyToNewId.set(row.Id, category.id);
    sortOrder += 1;
  }

  console.log(`  -> Đã nhập ${legacyToNewId.size} chuyên mục.`);
  return legacyToNewId;
}

async function migratePosts(pool: sql.ConnectionPool, categoryMap: Map<string, string>, authorId: string) {
  console.log("\n[2/8] Đang lấy danh sách bài viết (tblPost) từ web cũ...");
  // KHÔNG dùng sp_tblPost_GetByAll — sproc đó JOIN thêm tblCategory và làm "SELECT *, CategoryName =
  // tblCategory.Name" (xem full_schema.sql), nên kết quả có 2 CỘT CÙNG TÊN "Name" (Name của tblPost
  // VÀ Name của tblCategory). Driver mssql trả về giá trị của cột trùng tên dưới dạng MẢNG thay vì
  // ghi đè — gặp thật trên production: row.Name = ["Tiêu đề bài viết", "Tên chuyên mục"], khiến
  // ".trim()" vỡ (mảng không có .trim) và sau khi ép String() lại thành "Tiêu đề,Tên chuyên mục" (do
  // Array.prototype.toString() nối bằng dấu phẩy) — tiêu đề bài viết bị dính thêm tên chuyên mục nếu
  // không sửa. Dùng SELECT trực tiếp trên tblPost (không JOIN) để tránh hẳn xung đột tên cột.
  const result = await pool.request().query(
    "SELECT Id, CateId, Name, Link, Image, ContentUp, Content, CreateDate, Active FROM tblPost"
  );
  const rows = result.recordset as Array<{
    Id: string;
    CateId: string | null;
    Name: string | null;
    Link: string | null;
    Image: string | null;
    ContentUp: string | null;
    Content: string | null;
    CreateDate: string | null;
    Active: number | null;
  }>;
  console.log(`  -> Tìm thấy ${rows.length} bài viết ở web cũ.`);

  // Nạp trước slug đã có để tránh đụng độ khi tạo MỚI — KHÔNG dùng để quyết định slug cho bài ĐÃ
  // nhập ở lần chạy trước (tra theo legacyCode bên dưới), cùng lý do như migrateCategories() ở trên.
  const usedSlugs = new Set<string>();
  if (!DRY_RUN) {
    const existing = await prisma.post.findMany({ select: { slug: true } });
    existing.forEach((p) => usedSlugs.add(p.slug));
  }

  let imported = 0;
  let skippedNoCategory = 0;
  let unparsedDates = 0;

  for (const row of rows) {
    const title = str(row.Name);
    if (!title) {
      console.warn(`  [bỏ qua] Bài Id=${row.Id} không có tiêu đề.`);
      continue;
    }

    const categoryId = row.CateId ? categoryMap.get(row.CateId) : undefined;
    if (!categoryId) {
      skippedNoCategory += 1;
      console.warn(`  [bỏ qua] Bài "${title}" (Id=${row.Id}) có CateId=${row.CateId} không khớp chuyên mục nào đã nhập.`);
      continue;
    }

    const legacyCode = String(row.Id);

    // Toàn bộ 329 bài ở web cũ đều đang hiển thị công khai thật (đã xác nhận qua log dry-run — không
    // bài nào có Active=1 rõ ràng, web cũ hiển thị công khai theo cơ chế khác không chỉ dựa cột này),
    // và người dùng đã CHỌN rõ import PUBLISHED hết thay vì để DRAFT chờ duyệt tay từng bài — xem
    // quyết định trong chat lúc chạy dry-run ETL. KHÔNG dựa vào row.Active nữa.
    const isPublished = true;
    const parsedDate = parseLegacyDate(row.CreateDate);
    if (row.CreateDate && !parsedDate) unparsedDates += 1;
    const createdAt = parsedDate ?? new Date();

    const content = str(row.Content) || str(row.ContentUp) || "(Không có nội dung ở web cũ)";
    const excerpt = stripHtmlForExcerpt(row.ContentUp);

    if (DRY_RUN) {
      const baseSlugSource = str(row.Link) || title;
      const slug = uniqueSlug(slugify(baseSlugSource), usedSlugs, row.Id);
      console.log(`  [dry-run] Post "${title}" -> slug "${slug}", status=${isPublished ? "PUBLISHED" : "DRAFT"}`);
      imported += 1;
      continue;
    }

    // Đã nhập ở lần chạy trước (khớp legacyCode) -> GIỮ NGUYÊN slug hiện có (không đổi URL đã công
    // khai), chỉ tạo slug MỚI khi đây thực sự là bài viết chưa từng nhập.
    const existingPost = await prisma.post.findFirst({ where: { legacyCode } });
    const baseSlugSource = str(row.Link) || title;
    const slug = existingPost ? existingPost.slug : uniqueSlug(slugify(baseSlugSource), usedSlugs, row.Id);

    await upsertByLegacyCode(prisma.post, legacyCode, {
      slug,
      title,
      content,
      excerpt,
      coverImageUrl: normalizeAssetPath(str(row.Image)),
      categoryId,
      authorId,
      status: isPublished ? "PUBLISHED" : "DRAFT",
      publishedAt: isPublished ? createdAt : null,
      createdAt
    });
    imported += 1;
  }

  console.log(`  -> Đã nhập ${imported} bài viết. Bỏ qua ${skippedNoCategory} bài (thiếu chuyên mục khớp).`);
  if (unparsedDates > 0) {
    console.warn(`  -> CẢNH BÁO: ${unparsedDates} bài không đọc được CreateDate gốc, đã dùng ngày hiện tại thay thế.`);
  }
  console.warn(
    "  -> LƯU Ý: coverImageUrl giữ nguyên đường dẫn ảnh từ web cũ (vd /upload/images/...), đã chuẩn hoá " +
      "luôn có dấu \"/\" đầu (xem normalizeAssetPath). Ảnh chỉ hiển thị đúng nếu đã copy thư mục " +
      "upload/images của web cũ sang đúng vị trí tương ứng trên physical path web mới (xem deploy guide Bước 6.5)."
  );
}

/** Map cột [DocumentType] (int) của tblDocument theo đúng enum EOFFICE.Common.DocumentType. */
function mapDirection(raw: number | null, warnSet: Set<number>): "DRAFT" | "OUTGOING" | "INCOMING" {
  if (raw === 2) return "OUTGOING";
  if (raw === 3) return "INCOMING";
  if (raw !== 1 && raw !== null) warnSet.add(raw);
  return "DRAFT";
}

const STATUS_MAP: Record<number, string> = {
  1: "SAVE_DRAFT",
  2: "SEND_DRAFT",
  3: "WAIT_PUBLISH",
  4: "PUBLISHED",
  5: "PROCESSED",
  6: "PROCESSING",
  7: "SEND_AGAIN"
};

/** Map cột [Status] (lưu dạng string số) của tblDocument theo đúng enum EOFFICE.Common.DocumentStatus. */
function mapStatus(raw: unknown, warnSet: Set<string>): string {
  const s = str(raw);
  const n = s ? parseInt(s, 10) : NaN;
  if (Number.isFinite(n) && STATUS_MAP[n]) return STATUS_MAP[n];
  if (s) warnSet.add(s);
  return "SAVE_DRAFT";
}

/** Tra cứu bản ghi đã nhập trước đó theo legacyCode — thay cho Prisma upsert() vì cột legacyCode
 * KHÔNG đặt @unique (lý do: SQL Server chỉ cho phép 1 NULL trong UNIQUE constraint thường, mà bản
 * ghi tạo tay trên admin sau này sẽ luôn có legacyCode = NULL). */
async function upsertByLegacyCode<T extends { findFirst: Function; update: Function; create: Function }>(
  model: T,
  legacyCode: string,
  data: Record<string, unknown>
): Promise<{ id: string }> {
  const existing = await (model as any).findFirst({ where: { legacyCode } });
  if (existing) {
    return (model as any).update({ where: { id: existing.id }, data });
  }
  return (model as any).create({ data: { ...data, legacyCode } });
}

async function migrateDocumentTypes(pool: sql.ConnectionPool): Promise<Map<number, string>> {
  console.log("\n[3/8] Đang lấy danh sách loại công văn (tblDocumentKind) từ web cũ...");
  const result = await pool.request().query(
    "SELECT DocumentKindID, Name, Description, DocumentKindParent FROM tblDocumentKind"
  );
  const rows = result.recordset as Array<{
    DocumentKindID: number;
    Name: string | null;
    Description: string | null;
    DocumentKindParent: number | null;
  }>;
  console.log(`  -> Tìm thấy ${rows.length} loại công văn ở web cũ.`);

  const legacyToNewId = new Map<number, string>();

  // Bước 1: tạo/cập nhật tất cả trước, CHƯA gán parentId (vì thứ tự DocumentKindParent trong kết
  // quả không đảm bảo cha luôn đứng trước con).
  for (const row of rows) {
    const name = str(row.Name) || `Loại công văn ${row.DocumentKindID}`;
    const legacyCode = String(row.DocumentKindID);

    if (DRY_RUN) {
      legacyToNewId.set(row.DocumentKindID, `dry-run-${legacyCode}`);
      continue;
    }

    const type = await upsertByLegacyCode(prisma.documentType, legacyCode, {
      name,
      description: str(row.Description) || null
    });
    legacyToNewId.set(row.DocumentKindID, type.id);
  }

  // Bước 2: gán lại parentId giờ đã có đủ map legacy -> new id.
  if (!DRY_RUN) {
    for (const row of rows) {
      if (!row.DocumentKindParent) continue;
      const newId = legacyToNewId.get(row.DocumentKindID);
      const parentNewId = legacyToNewId.get(row.DocumentKindParent);
      if (newId && parentNewId && newId !== parentNewId) {
        await prisma.documentType.update({ where: { id: newId }, data: { parentId: parentNewId } });
      }
    }
  }

  console.log(`  -> Đã nhập ${legacyToNewId.size} loại công văn.`);
  return legacyToNewId;
}

async function migrateOfficialDocuments(
  pool: sql.ConnectionPool,
  documentTypeMap: Map<number, string>
): Promise<Map<string, string>> {
  console.log("\n[4/8] Đang lấy danh sách công văn (tblDocument) từ web cũ — có thể mất chút thời gian với 2.494 dòng...");

  const [documentsResult, officialsResult, usersResult] = await Promise.all([
    pool.request().query(`
      SELECT DocumentID, DocumentNumber, Name, Excerpt, Content, PublishDate, PublishOffical, Attachs,
             IDDocumentKind, CreateDate, IDUserCreate, UserProcess, StartProcess, EndProcess, SendDate,
             ReceiveDate, SendOfficals, Priority, Status, DocumentType, ShowWeb
      FROM tblDocument
    `),
    pool.request().query("SELECT OfficalID, Name FROM tblOffical"),
    pool.request().query("SELECT UserID, FullName FROM tblUser")
  ]);

  const officeNameById = new Map<number, string>(
    (officialsResult.recordset as Array<{ OfficalID: number; Name: unknown }>).map((o) => [
      o.OfficalID,
      str(o.Name)
    ])
  );
  const userNameById = new Map<number, string>(
    (usersResult.recordset as Array<{ UserID: number; FullName: unknown }>).map((u) => [
      u.UserID,
      str(u.FullName)
    ])
  );

  function resolveUserProcessNames(csv: unknown): string | null {
    const s = str(csv);
    if (!s) return null;
    const names = s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((idStr) => userNameById.get(parseInt(idStr, 10)))
      .filter((n): n is string => Boolean(n));
    return names.length > 0 ? names.join(", ") : null;
  }

  const rows = documentsResult.recordset as Array<{
    DocumentID: string;
    DocumentNumber: string | null;
    Name: string | null;
    Excerpt: string | null;
    Content: string | null;
    PublishDate: Date | null;
    PublishOffical: number | null;
    Attachs: string | null;
    IDDocumentKind: number | null;
    CreateDate: Date | null;
    IDUserCreate: number | null;
    UserProcess: string | null;
    StartProcess: Date | null;
    EndProcess: Date | null;
    SendDate: Date | null;
    ReceiveDate: Date | null;
    SendOfficals: string | null;
    Priority: string | null;
    Status: string | null;
    DocumentType: number | null;
    ShowWeb: number | null;
  }>;
  console.log(`  -> Tìm thấy ${rows.length} công văn ở web cũ.`);

  const legacyToNewId = new Map<string, string>();
  const unknownDirections = new Set<number>();
  const unknownStatuses = new Set<string>();
  let imported = 0;
  let skippedNoType = 0;
  let skippedNoTitle = 0;

  for (const row of rows) {
    const title = str(row.Name);
    if (!title) {
      skippedNoTitle += 1;
      continue;
    }

    const documentTypeId = row.IDDocumentKind ? documentTypeMap.get(row.IDDocumentKind) : undefined;
    if (!documentTypeId) {
      skippedNoType += 1;
      continue;
    }

    const direction = mapDirection(row.DocumentType, unknownDirections);
    const status = mapStatus(row.Status, unknownStatuses);
    const legacyCode = row.DocumentID;

    if (DRY_RUN) {
      legacyToNewId.set(legacyCode, `dry-run-${legacyCode}`);
      imported += 1;
      continue;
    }

    const data = {
      title,
      documentNumber: str(row.DocumentNumber) || null,
      content: str(row.Content) || null,
      summary: str(row.Excerpt) || null,
      direction,
      status,
      priority: str(row.Priority) || null,
      isPublic: row.ShowWeb === 1,
      documentTypeId,
      issuingOfficeName: row.PublishOffical ? officeNameById.get(row.PublishOffical) ?? null : null,
      createdByName: row.IDUserCreate ? userNameById.get(row.IDUserCreate) ?? null : null,
      processedByNames: resolveUserProcessNames(row.UserProcess),
      sentToRaw: str(row.SendOfficals) || null,
      issuedAt: row.PublishDate ?? null,
      sentAt: row.SendDate ?? null,
      receivedAt: row.ReceiveDate ?? null,
      processStartAt: row.StartProcess ?? null,
      processEndAt: row.EndProcess ?? null,
      createdAt: row.CreateDate ?? undefined
    };

    const doc = await upsertByLegacyCode(prisma.officialDocument, legacyCode, data);
    legacyToNewId.set(legacyCode, doc.id);
    imported += 1;
  }

  console.log(
    `  -> Đã nhập ${imported} công văn. Bỏ qua ${skippedNoTitle} (thiếu tiêu đề), ${skippedNoType} (thiếu loại công văn khớp).`
  );
  if (unknownDirections.size > 0) {
    console.warn(`  -> CẢNH BÁO: giá trị DocumentType lạ (đã mặc định DRAFT): ${[...unknownDirections].join(", ")}`);
  }
  if (unknownStatuses.size > 0) {
    console.warn(`  -> CẢNH BÁO: giá trị Status lạ (đã mặc định SAVE_DRAFT): ${[...unknownStatuses].join(", ")}`);
  }
  return legacyToNewId;
}

async function migrateAttachments(pool: sql.ConnectionPool, documentMap: Map<string, string>) {
  console.log("\n[5/8] Đang lấy danh sách file đính kèm công văn (tblAttach) từ web cũ...");
  const [attachResult, documentsResult] = await Promise.all([
    pool.request().query("SELECT AttachID, Name, Description, Path FROM tblAttach"),
    pool.request().query("SELECT DocumentID, Attachs FROM tblDocument WHERE Attachs IS NOT NULL AND Attachs <> '' AND Attachs <> ','")
  ]);

  const attachById = new Map<number, { Name: unknown; Description: unknown; Path: unknown }>(
    (attachResult.recordset as Array<{ AttachID: number; Name: unknown; Description: unknown; Path: unknown }>).map(
      (a) => [a.AttachID, { Name: a.Name, Description: a.Description, Path: a.Path }]
    )
  );

  let imported = 0;
  let skippedNoDocument = 0;
  let skippedNoAttach = 0;

  for (const row of documentsResult.recordset as Array<{ DocumentID: string; Attachs: string | null }>) {
    const documentId = documentMap.get(row.DocumentID);
    if (!documentId) {
      skippedNoDocument += 1;
      continue;
    }

    const attachIds = str(row.Attachs)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isFinite(n));

    for (const attachId of attachIds) {
      const attach = attachById.get(attachId);
      const attachPath = attach ? str(attach.Path) : "";
      if (!attach || !attachPath) {
        skippedNoAttach += 1;
        continue;
      }

      if (DRY_RUN) {
        imported += 1;
        continue;
      }

      await upsertByLegacyCode(prisma.documentAttachment, String(attachId), {
        fileName: str(attach.Name) || `file-${attachId}`,
        description: str(attach.Description) || null,
        path: attachPath,
        documentId
      });
      imported += 1;
    }
  }

  console.log(
    `  -> Đã nhập ${imported} file đính kèm. Bỏ qua ${skippedNoDocument} (công văn không khớp), ${skippedNoAttach} (AttachID không tồn tại/thiếu Path).`
  );
  console.warn(
    "  -> LƯU Ý: cần copy nguyên thư mục web_cu/MyWeb/CV2/Document/DocumentFiles sang server mới " +
      "(giữ cấu trúc thư mục con theo username) để đường dẫn trong DocumentAttachment.path hoạt động đúng."
  );
}

async function migrateUnionDepartments(pool: sql.ConnectionPool): Promise<Map<string, string>> {
  console.log("\n[6/8] Đang lấy danh sách công đoàn bộ phận (CONGDOANBOPHAN) từ web cũ...");
  const result = await pool.request().query("SELECT MACDBP, TENCDBP FROM CONGDOANBOPHAN");
  const rows = result.recordset as Array<{ MACDBP: string; TENCDBP: string | null }>;
  console.log(`  -> Tìm thấy ${rows.length} công đoàn bộ phận ở web cũ.`);

  const legacyToNewId = new Map<string, string>();
  let sortOrder = 0;

  for (const row of rows) {
    const name = str(row.TENCDBP) || `Bộ phận ${row.MACDBP}`;
    const legacyCode = str(row.MACDBP);
    if (!legacyCode) continue;

    if (DRY_RUN) {
      console.log(`  [dry-run] UnionDepartment "${name}"`);
      legacyToNewId.set(legacyCode, `dry-run-${legacyCode}`);
      sortOrder += 1;
      continue;
    }

    const dept = await upsertByLegacyCode(prisma.unionDepartment, legacyCode, {
      name,
      sortOrder
    });
    legacyToNewId.set(legacyCode, dept.id);
    sortOrder += 1;
  }

  console.log(`  -> Đã nhập ${legacyToNewId.size} công đoàn bộ phận.`);
  return legacyToNewId;
}

/** SQL Server datetime dùng "1900-01-01 00:00:00.000" làm giá trị placeholder "chưa nhập" ở rất nhiều
 * cột NHANVIEN (xác nhận thật từ mẫu dữ liệu người quản trị cung cấp, KHÔNG đoán) — coi mọi ngày <=
 * 1901-01-01 là chưa nhập thật, trả về null thay vì lưu nguyên 1900-01-01 (vô nghĩa với field kiểu
 * "ngày vào Đảng"/"ngày ký hợp đồng"...). */
function toRealDateOrNull(raw: unknown): Date | null {
  if (!raw || !(raw instanceof Date) || Number.isNaN(raw.getTime())) return null;
  return raw.getFullYear() <= 1901 ? null : raw;
}

/** NHANVIEN lưu 1 số field dạng cờ 0/1 (DATOTNGHIEP, DABOIDUONGNGHIEPVUSP) — driver mssql có thể trả
 * number HOẶC boolean tuỳ kiểu cột khai báo thật, xử lý cả 2. */
function toBoolOrNull(raw: unknown): boolean | null {
  if (raw === 1 || raw === true || raw === "1") return true;
  if (raw === 0 || raw === false || raw === "0") return false;
  return null;
}

function toIntOrNull(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Danh bạ công đoàn viên — nguồn NHANVIEN. UnionMember giữ 6 field thật sự hiển thị công khai ở
 * modules/GioiThieuCongDoanVien.aspx(.cs) (xem chú thích domain block UNIONDIRECTORY trong
 * prisma/schema.prisma). UnionMemberProfile giữ TOÀN BỘ phần còn lại của NHANVIEN (~90 cột gốc) —
 * CHỈ dùng cho màn hình quản trị nội bộ, KHÔNG lộ ra endpoint/trang công khai nào (xem
 * UnionMembersService.findOneForAdmin ở BE) — bổ sung theo yêu cầu đối chiếu lại đầy đủ so với web cũ.
 *
 * LƯU Ý: GIOITINH suy luận là 0=Nữ/1=Nam dựa trên đối chiếu tên trong mẫu dữ liệu thật (KHÔNG xác nhận
 * được từ code-behind vì GioiThieuCongDoanVien.aspx.cs không hiển thị field này) — admin nên rà lại
 * sau khi import lần đầu, đặc biệt các dòng dữ liệu không theo mẫu tên phổ biến. */
async function migrateUnionMembers(pool: sql.ConnectionPool, departmentMap: Map<string, string>) {
  console.log("\n[7/8] Đang lấy danh sách công đoàn viên (NHANVIEN) từ web cũ...");

  const [membersResult, degreesResult, positionsResult] = await Promise.all([
    pool.request().query(`
      SELECT MANV, MALUONGNV, MAHOSONV, HOTEN, BIDANH, HINHANH, GIOITINH, NGAYSINH, NOISINH, CMND,
        NGAYCAPCMND, NOICAPCMND, DANTOCNV, TONGIAONV, QUOCTICHNV, QUEQUAN, DIACHITHUONGTRU, NOIOHIENNAY,
        DIENTHOAICOQUAN, DIENTHOAINHA, DIENTHOAIDD, EMAIL, TINHTRANGHONNHAN, THANHPHANXUATTHAN,
        DIENUUTIENGIADINH, DIENUUTIENBANTHAN, NANGKHIEU, TINHTRANGSUCKHOE, NHOMMAU, CHIEUCAO, CANNANG,
        KHUYETTAT, PHONGBAN, BOPHAN, SOQD, CHUCVU, NGAYVAONGANHGIAODUC, NGAYHOPDONG, NGAYTUYENDUNG,
        NGAYVAODANG, NGAYVAOCOQUAN, NGAYCHINHTHUCVAODANG, HINHTHUCTUYENDUNG, COQUANTUYENDUNG,
        CONGVIECDUOCGIAO, CONGVIECHIENNAY, NGAYVAODOAN, NOIVAODOAN, CHUCVUDOAN, NGAYVAOCONGDOAN,
        NOIVAOCONGDOAN, CHUCVUCONGDOAN, NOIVAODANG, CHUCVUDANG, TD_HOCVANNV, DATOTNGHIEP,
        TD_CHUYENMONCAONHAT, NGANHDAOTAO, CHUYENNGANHDAOTAO, NOIDAOTAO, HINHTHUCDAOTAO, NAMTOTNGHIEP,
        DABOIDUONGNGHIEPVUSP, TD_LYLUANCHINHTRI, TD_QUANLYNHANUOC, TD_QUANLYGIAODUC, NGOAINGUCHINHNV,
        TD_NGOAINGUNV, NGOAINGUKHAC, TD_TINHOCNV, STATUS, GhiChuLuong, GhiChuThamNien,
        CHUCDANHNGHENGHIEP, NGACHLUONG, HINHTHUCLAODONG, SOBHXH, SOBHXHCU, DIACHILIENLAC, CHIBO,
        NGAYNGHIHUU, NGAYRADANG, SOTHEDANG, CONGDOANBOPHAN, TRANGTHAIDEN, NGAYCHUYENDEN, TRANGTHAIDI,
        NGAYCHUYENDI, donvi
      FROM NHANVIEN
    `),
    pool.request().query("SELECT MATDHV, GHICHU FROM TRINHDOHOCVAN"),
    pool.request().query("SELECT MACV, TENCV FROM CHUCVU")
  ]);

  // Trình độ chuyên môn cao nhất: NHANVIEN.TD_CHUYENMONCAONHAT lưu MÃ (khớp TRINHDOHOCVAN.MATDHV), tên
  // hiển thị lấy từ cột GHICHU (KHÔNG phải TENTDHV) — đúng theo hàm LayTrinhDo() trong
  // GioiThieuCongDoanVien.aspx.cs, KHÔNG đoán.
  const degreeLabelByCode = new Map<string, string>(
    (degreesResult.recordset as Array<{ MATDHV: string; GHICHU: string | null }>)
      .map((d): [string, string] => [str(d.MATDHV), str(d.GHICHU)])
      .filter(([, label]) => label)
  );
  // Chức vụ: NHANVIEN.CHUCVU lưu MÃ (khớp CHUCVU.MACV), tên hiển thị lấy từ CHUCVU.TENCV — đúng theo
  // hàm LayChucVu() (bỏ tiền tố "Chức vụ: " mà hàm gốc tự thêm, vì đó là style trình bày của web cũ,
  // web mới tự trình bày lại theo UI riêng).
  const positionTitleByCode = new Map<string, string>(
    (positionsResult.recordset as Array<{ MACV: string; TENCV: string | null }>)
      .map((p): [string, string] => [str(p.MACV), str(p.TENCV)])
      .filter(([, label]) => label)
  );

  const rows = membersResult.recordset as Array<{
    MANV: string;
    MALUONGNV: string | null;
    MAHOSONV: string | null;
    HOTEN: string | null;
    BIDANH: string | null;
    HINHANH: string | null;
    GIOITINH: number | boolean | null;
    NGAYSINH: Date | null;
    NOISINH: string | null;
    CMND: string | null;
    NGAYCAPCMND: Date | null;
    NOICAPCMND: string | null;
    DANTOCNV: string | null;
    TONGIAONV: string | null;
    QUOCTICHNV: string | null;
    QUEQUAN: string | null;
    DIACHITHUONGTRU: string | null;
    NOIOHIENNAY: string | null;
    DIENTHOAICOQUAN: string | null;
    DIENTHOAINHA: string | null;
    DIENTHOAIDD: string | null;
    EMAIL: string | null;
    TINHTRANGHONNHAN: string | null;
    THANHPHANXUATTHAN: string | null;
    DIENUUTIENGIADINH: string | null;
    DIENUUTIENBANTHAN: string | null;
    NANGKHIEU: string | null;
    TINHTRANGSUCKHOE: string | null;
    NHOMMAU: string | null;
    CHIEUCAO: number | null;
    CANNANG: number | null;
    KHUYETTAT: string | null;
    PHONGBAN: string | null;
    BOPHAN: string | null;
    SOQD: string | null;
    CHUCVU: string | null;
    NGAYVAONGANHGIAODUC: Date | null;
    NGAYHOPDONG: Date | null;
    NGAYTUYENDUNG: Date | null;
    NGAYVAODANG: Date | null;
    NGAYVAOCOQUAN: Date | null;
    NGAYCHINHTHUCVAODANG: Date | null;
    HINHTHUCTUYENDUNG: string | null;
    COQUANTUYENDUNG: string | null;
    CONGVIECDUOCGIAO: string | null;
    CONGVIECHIENNAY: string | null;
    NGAYVAODOAN: Date | null;
    NOIVAODOAN: string | null;
    CHUCVUDOAN: string | null;
    NGAYVAOCONGDOAN: Date | null;
    NOIVAOCONGDOAN: string | null;
    CHUCVUCONGDOAN: string | null;
    NOIVAODANG: string | null;
    CHUCVUDANG: string | null;
    TD_HOCVANNV: string | null;
    DATOTNGHIEP: number | boolean | null;
    TD_CHUYENMONCAONHAT: string | null;
    NGANHDAOTAO: string | null;
    CHUYENNGANHDAOTAO: string | null;
    NOIDAOTAO: string | null;
    HINHTHUCDAOTAO: string | null;
    NAMTOTNGHIEP: number | null;
    DABOIDUONGNGHIEPVUSP: number | boolean | null;
    TD_LYLUANCHINHTRI: string | null;
    TD_QUANLYNHANUOC: string | null;
    TD_QUANLYGIAODUC: string | null;
    NGOAINGUCHINHNV: string | null;
    TD_NGOAINGUNV: string | null;
    NGOAINGUKHAC: string | null;
    TD_TINHOCNV: string | null;
    STATUS: number | null;
    GhiChuLuong: string | null;
    GhiChuThamNien: string | null;
    CHUCDANHNGHENGHIEP: string | null;
    NGACHLUONG: string | null;
    HINHTHUCLAODONG: string | null;
    SOBHXH: string | null;
    SOBHXHCU: string | null;
    DIACHILIENLAC: string | null;
    CHIBO: string | null;
    NGAYNGHIHUU: Date | null;
    NGAYRADANG: Date | null;
    SOTHEDANG: string | null;
    CONGDOANBOPHAN: string | null;
    TRANGTHAIDEN: string | null;
    NGAYCHUYENDEN: Date | null;
    TRANGTHAIDI: string | null;
    NGAYCHUYENDI: Date | null;
    donvi: string | null;
  }>;
  console.log(`  -> Tìm thấy ${rows.length} công đoàn viên ở web cũ.`);

  let imported = 0;
  let skippedNoName = 0;
  let sortOrder = 0;

  for (const row of rows) {
    const fullName = str(row.HOTEN);
    if (!fullName) {
      skippedNoName += 1;
      continue;
    }

    const legacyCode = str(row.MANV);
    const departmentId = row.CONGDOANBOPHAN ? departmentMap.get(str(row.CONGDOANBOPHAN)) : undefined;
    // STATUS=1 ở web cũ = hiển thị công khai (xem NHANVIEN.STATUS=1 trong btnSearch_Click()/LoadNEws()
    // của GioiThieuCongDoanVien.aspx.cs) — map thẳng vào isPublic, admin có thể tự bật/tắt sau này.
    const isPublic = row.STATUS === 1;

    if (DRY_RUN) {
      console.log(`  [dry-run] UnionMember "${fullName}" (isPublic=${isPublic})`);
      imported += 1;
      sortOrder += 1;
      continue;
    }

    const member = await upsertByLegacyCode(prisma.unionMember, legacyCode, {
      fullName,
      photoUrl: normalizeAssetPath(str(row.HINHANH)),
      degreeLabel: degreeLabelByCode.get(str(row.TD_CHUYENMONCAONHAT)) ?? null,
      positionTitle: positionTitleByCode.get(str(row.CHUCVU)) ?? null,
      phone: str(row.DIENTHOAIDD) || null,
      email: str(row.EMAIL) || null,
      isPublic,
      sortOrder,
      departmentId: departmentId ?? null
    });

    const profileData = {
      alias: str(row.BIDANH) || null,
      gender: row.GIOITINH === 1 || row.GIOITINH === true ? "Nam" : row.GIOITINH === 0 || row.GIOITINH === false ? "Nữ" : null,
      dateOfBirth: toRealDateOrNull(row.NGAYSINH),
      placeOfBirth: str(row.NOISINH) || null,
      idCardNumber: str(row.CMND) || null,
      idCardIssuedDate: toRealDateOrNull(row.NGAYCAPCMND),
      idCardIssuedPlace: str(row.NOICAPCMND) || null,
      ethnicity: str(row.DANTOCNV) || null,
      religion: str(row.TONGIAONV) || null,
      nationality: str(row.QUOCTICHNV) || null,
      hometown: str(row.QUEQUAN) || null,
      permanentAddress: str(row.DIACHITHUONGTRU) || null,
      currentAddress: str(row.NOIOHIENNAY) || null,
      contactAddress: str(row.DIACHILIENLAC) || null,
      officePhone: str(row.DIENTHOAICOQUAN) || null,
      homePhone: str(row.DIENTHOAINHA) || null,
      maritalStatus: str(row.TINHTRANGHONNHAN) || null,
      familyBackground: str(row.THANHPHANXUATTHAN) || null,
      familyPriorityGroup: str(row.DIENUUTIENGIADINH) || null,
      selfPriorityGroup: str(row.DIENUUTIENBANTHAN) || null,
      talent: str(row.NANGKHIEU) || null,
      healthStatus: str(row.TINHTRANGSUCKHOE) || null,
      bloodType: str(row.NHOMMAU) || null,
      heightCm: toIntOrNull(row.CHIEUCAO),
      weightKg: toIntOrNull(row.CANNANG),
      disability: str(row.KHUYETTAT) || null,

      facultyOrDepartmentLabel: str(row.PHONGBAN) || null,
      workUnit: str(row.BOPHAN) || null,
      decisionNumber: str(row.SOQD) || null,
      joinedEducationSectorDate: toRealDateOrNull(row.NGAYVAONGANHGIAODUC),
      contractDate: toRealDateOrNull(row.NGAYHOPDONG),
      recruitmentDate: toRealDateOrNull(row.NGAYTUYENDUNG),
      joinedAgencyDate: toRealDateOrNull(row.NGAYVAOCOQUAN),
      recruitmentMethod: str(row.HINHTHUCTUYENDUNG) || null,
      recruitingAgency: str(row.COQUANTUYENDUNG) || null,
      assignedJob: str(row.CONGVIECDUOCGIAO) || null,
      currentJob: str(row.CONGVIECHIENNAY) || null,

      partyCandidateDate: toRealDateOrNull(row.NGAYVAODANG),
      partyOfficialDate: toRealDateOrNull(row.NGAYCHINHTHUCVAODANG),
      partyJoinedPlace: str(row.NOIVAODANG) || null,
      partyPosition: str(row.CHUCVUDANG) || null,
      partyLeftDate: toRealDateOrNull(row.NGAYRADANG),
      partyCardNumber: str(row.SOTHEDANG) || null,
      partyCell: str(row.CHIBO) || null,

      youthUnionJoinedDate: toRealDateOrNull(row.NGAYVAODOAN),
      youthUnionJoinedPlace: str(row.NOIVAODOAN) || null,
      youthUnionPosition: str(row.CHUCVUDOAN) || null,

      unionJoinedDate: toRealDateOrNull(row.NGAYVAOCONGDOAN),
      unionJoinedPlace: str(row.NOIVAOCONGDOAN) || null,
      unionPosition: str(row.CHUCVUCONGDOAN) || null,
      unionSectionLabel: str(row.CONGDOANBOPHAN) || null,

      generalEducationLevel: str(row.TD_HOCVANNV) || null,
      hasGraduated: toBoolOrNull(row.DATOTNGHIEP),
      trainingField: str(row.NGANHDAOTAO) || null,
      trainingMajor: str(row.CHUYENNGANHDAOTAO) || null,
      trainingPlace: str(row.NOIDAOTAO) || null,
      trainingMethod: str(row.HINHTHUCDAOTAO) || null,
      graduationYear: toIntOrNull(row.NAMTOTNGHIEP),
      hasPedagogyTraining: toBoolOrNull(row.DABOIDUONGNGHIEPVUSP),
      politicalTheoryLevel: str(row.TD_LYLUANCHINHTRI) || null,
      stateManagementLevel: str(row.TD_QUANLYNHANUOC) || null,
      educationManagementLevel: str(row.TD_QUANLYGIAODUC) || null,
      mainForeignLanguage: str(row.NGOAINGUCHINHNV) || null,
      foreignLanguageLevel: str(row.TD_NGOAINGUNV) || null,
      otherForeignLanguage: str(row.NGOAINGUKHAC) || null,
      itLevel: str(row.TD_TINHOCNV) || null,

      salaryNote: str(row.GhiChuLuong) || null,
      seniorityNote: str(row.GhiChuThamNien) || null,
      jobTitle: str(row.CHUCDANHNGHENGHIEP) || null,
      salaryGrade: str(row.NGACHLUONG) || null,
      laborType: str(row.HINHTHUCLAODONG) || null,
      socialInsuranceNumber: str(row.SOBHXH) || null,
      oldSocialInsuranceNumber: str(row.SOBHXHCU) || null,
      retirementDate: toRealDateOrNull(row.NGAYNGHIHUU),
      incomingStatus: str(row.TRANGTHAIDEN) || null,
      incomingDate: toRealDateOrNull(row.NGAYCHUYENDEN),
      outgoingStatus: str(row.TRANGTHAIDI) || null,
      outgoingDate: toRealDateOrNull(row.NGAYCHUYENDI),

      salaryCode: str(row.MALUONGNV) || null,
      fileCode: str(row.MAHOSONV) || null,
      unitLabel: str(row.donvi) || null
    };

    await prisma.unionMemberProfile.upsert({
      where: { memberId: member.id },
      create: { memberId: member.id, ...profileData },
      update: profileData
    });

    imported += 1;
    sortOrder += 1;
  }

  console.log(`  -> Đã nhập ${imported} công đoàn viên (kèm hồ sơ nội bộ). Bỏ qua ${skippedNoName} (thiếu họ tên).`);
  console.warn(
    "  -> LƯU Ý: photoUrl giữ nguyên đường dẫn ảnh từ NHANVIEN.HINHANH (chuẩn hoá luôn có dấu \"/\" " +
      "đầu, xem normalizeAssetPath) — chỉ hiển thị đúng nếu đã copy đủ thư mục upload/images/AnhCDV " +
      "của web cũ sang server mới (xem deploy guide Bước 6.5)."
  );
}

async function migrateHomeSlides(pool: sql.ConnectionPool) {
  console.log("\n[8/8] Đang lấy danh sách banner trang chủ (tblSlide) từ web cũ...");
  // Lọc Active=1 giống hệt web cũ (xem modules/uc_Slide.ascx.cs: tblSlideService.tblSlide_GetByTop("",
  // "Active=1", "")) — banner không Active=1 không hiển thị công khai nên không cần nhập.
  const result = await pool.request().query("SELECT Id, Name, Image, Active FROM tblSlide WHERE Active = 1");
  const rows = result.recordset as Array<{ Id: number; Name: string | null; Image: string | null; Active: number | null }>;
  console.log(`  -> Tìm thấy ${rows.length} banner đang Active ở web cũ.`);

  let imported = 0;
  let skippedNoImage = 0;
  let sortOrder = 0;

  for (const row of rows) {
    const imageUrl = normalizeAssetPath(str(row.Image));
    if (!imageUrl) {
      skippedNoImage += 1;
      continue;
    }
    const legacyCode = String(row.Id);
    const name = str(row.Name) || `Banner ${row.Id}`;

    if (DRY_RUN) {
      console.log(`  [dry-run] HomeSlide "${name}"`);
      imported += 1;
      sortOrder += 1;
      continue;
    }

    await upsertByLegacyCode(prisma.homeSlide, legacyCode, {
      name,
      imageUrl,
      sortOrder,
      isActive: true
    });
    imported += 1;
    sortOrder += 1;
  }

  console.log(`  -> Đã nhập ${imported} banner. Bỏ qua ${skippedNoImage} (thiếu ảnh).`);
}

async function main() {
  console.log(`=== ETL nội dung web cũ -> web mới ${DRY_RUN ? "(DRY-RUN — không ghi CSDL)" : ""} ===`);
  console.log("Đang kết nối CSDL web cũ...");
  const pool = await connectLegacyDb();
  console.log("  -> Kết nối thành công.");

  try {
    const authorId = await ensureImportBotUser();
    const categoryMap = await migrateCategories(pool);
    await migratePosts(pool, categoryMap, authorId);

    const documentTypeMap = await migrateDocumentTypes(pool);
    const documentMap = await migrateOfficialDocuments(pool, documentTypeMap);
    await migrateAttachments(pool, documentMap);

    const departmentMap = await migrateUnionDepartments(pool);
    await migrateUnionMembers(pool, departmentMap);
    await migrateHomeSlides(pool);

    console.log("\n=== HOÀN TẤT ===");
    if (DRY_RUN) console.log("(Đây là dry-run — chưa có gì được ghi vào CSDL mới. Bỏ LEGACY_MIGRATE_DRY_RUN để chạy thật.)");
  } finally {
    await pool.close();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("LỖI ETL:", e);
  process.exit(1);
});
