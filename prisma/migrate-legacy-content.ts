/**
 * ETL: nhập dữ liệu "Tin tức + Chuyên mục" từ CSDL web cũ (CMS_CongDoan, SQL Server, server
 * 45.117.177.224) sang CSDL mới (CongDoanUtehy) qua Prisma.
 *
 * PHẠM VI HIỆN TẠI: chỉ tblCategory -> Category và tblPost -> Post.
 *
 * KHÔNG bao gồm (xem giải thích trong chat / báo cáo khảo sát mã nguồn web cũ):
 *   - tblNguoiDung (tài khoản)      — không có DAL/stored procedure nào trong code web cũ gọi tới
 *     bảng này (0 kết quả khi grep toàn bộ web_cu). Web.config cho thấy đăng nhập thật của web cũ
 *     dùng ASP.NET SqlMembershipProvider (bảng aspnet_Users/aspnet_Membership...), KHÔNG phải
 *     tblNguoiDung. Chưa rõ tblNguoiDung có dữ liệu thật hay chỉ là scaffold bỏ dở.
 *   - tblCongDoanVien (hồ sơ đoàn viên) — cũng 0 kết quả grep; hệ thống mới chưa có domain
 *     Membership (Phase 2) nên chưa có bảng đích để đổ dữ liệu vào.
 *   - tblPostCongVan / tblNoiDungCV / tblLoaiCV / tblFileDinhKem (công văn) — cũng 0 kết quả grep;
 *     Web.config trỏ QuanLyCongVanConnectionString về SQL Express cục bộ (sa/sa) khác hẳn CSDL
 *     production (45.117.177.224/CMS_CongDoan) — nhiều khả năng module công văn trong bản code
 *     này chưa từng chạy thật trên server production, hoặc dùng một CSDL khác không có trong bản
 *     upload. Hệ thống mới cũng chưa có domain OfficialDocument (Phase 3).
 *   => Trước khi build Phase 2/3, cần xác nhận trực tiếp trên CSDL production (không phải đọc code)
 *      xem các bảng tblNguoiDung/tblCongDoanVien/tblPostCongVan/tblNoiDungCV có dữ liệu thật không
 *      (xem hướng dẫn kiểm tra nhanh bằng SQL ở cuối deploy guide).
 *
 * Cách chạy (từ server, sau khi đã prisma:generate và có DATABASE_URL trong .env):
 *   1. Thêm vào .env: LEGACY_DB_HOST / LEGACY_DB_PORT / LEGACY_DB_NAME / LEGACY_DB_USER / LEGACY_DB_PASSWORD
 *   2. Thử trước (không ghi gì vào CSDL mới, chỉ log ra sẽ làm gì):
 *        LEGACY_MIGRATE_DRY_RUN=true pnpm migrate:legacy
 *   3. Chạy thật:
 *        pnpm migrate:legacy
 * Script dùng upsert theo slug nên chạy lại nhiều lần là AN TOÀN (idempotent), không tạo trùng.
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
function parseLegacyDate(raw: string | null | undefined): Date | null {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();

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
function stripHtmlForExcerpt(html: string | null | undefined, maxLen = 300): string | undefined {
  if (!html) return undefined;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
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
  console.log("\n[1/2] Đang lấy danh sách chuyên mục (sp_tblCategory_GetByAll) từ web cũ...");
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

  // Nạp trước slug đã tồn tại trong CSDL mới để tránh đụng độ với dữ liệu đã có (vd chuyên mục seed sẵn).
  if (!DRY_RUN) {
    const existing = await prisma.category.findMany({ select: { slug: true } });
    existing.forEach((c) => usedSlugs.add(c.slug));
  }

  let sortOrder = 0;
  for (const row of rows) {
    const name = (row.Name ?? "").trim() || `Chuyên mục ${row.Id}`;
    const slug = uniqueSlug(slugify(name), usedSlugs, row.Id);

    if (DRY_RUN) {
      console.log(`  [dry-run] Category "${name}" -> slug "${slug}"`);
      legacyToNewId.set(row.Id, `dry-run-${row.Id}`);
      sortOrder += 1;
      continue;
    }

    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name,
        description: row.MetaDescription?.trim() || null
      },
      create: {
        slug,
        name,
        description: row.MetaDescription?.trim() || null,
        sortOrder
      }
    });
    legacyToNewId.set(row.Id, category.id);
    sortOrder += 1;
  }

  console.log(`  -> Đã nhập ${legacyToNewId.size} chuyên mục.`);
  return legacyToNewId;
}

async function migratePosts(pool: sql.ConnectionPool, categoryMap: Map<string, string>, authorId: string) {
  console.log("\n[2/2] Đang lấy danh sách bài viết (sp_tblPost_GetByAll) từ web cũ...");
  const result = await pool.request().execute("sp_tblPost_GetByAll");
  const rows = result.recordset as Array<{
    Id: string;
    CateId: string | null;
    Name: string | null;
    Link: string | null;
    Image: string | null;
    ContentUp: string | null;
    Content: string | null;
    CreateDate: string | null;
    Active: string | null;
  }>;
  console.log(`  -> Tìm thấy ${rows.length} bài viết ở web cũ.`);

  const usedSlugs = new Set<string>();
  if (!DRY_RUN) {
    const existing = await prisma.post.findMany({ select: { slug: true } });
    existing.forEach((p) => usedSlugs.add(p.slug));
  }

  let imported = 0;
  let skippedNoCategory = 0;
  let unparsedDates = 0;

  for (const row of rows) {
    const title = (row.Name ?? "").trim();
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

    const baseSlugSource = row.Link?.trim() || title;
    const slug = uniqueSlug(slugify(baseSlugSource), usedSlugs, row.Id);

    const isPublished = row.Active === "1" || row.Active?.toLowerCase() === "true";
    const parsedDate = parseLegacyDate(row.CreateDate);
    if (row.CreateDate && !parsedDate) unparsedDates += 1;
    const createdAt = parsedDate ?? new Date();

    const content = row.Content?.trim() || row.ContentUp?.trim() || "(Không có nội dung ở web cũ)";
    const excerpt = stripHtmlForExcerpt(row.ContentUp);

    if (DRY_RUN) {
      console.log(`  [dry-run] Post "${title}" -> slug "${slug}", status=${isPublished ? "PUBLISHED" : "DRAFT"}`);
      imported += 1;
      continue;
    }

    await prisma.post.upsert({
      where: { slug },
      update: {
        title,
        content,
        excerpt,
        coverImageUrl: row.Image?.trim() || null,
        categoryId,
        status: isPublished ? "PUBLISHED" : "DRAFT",
        publishedAt: isPublished ? createdAt : null
      },
      create: {
        slug,
        title,
        content,
        excerpt,
        coverImageUrl: row.Image?.trim() || null,
        categoryId,
        authorId,
        status: isPublished ? "PUBLISHED" : "DRAFT",
        publishedAt: isPublished ? createdAt : null,
        createdAt
      }
    });
    imported += 1;
  }

  console.log(`  -> Đã nhập ${imported} bài viết. Bỏ qua ${skippedNoCategory} bài (thiếu chuyên mục khớp).`);
  if (unparsedDates > 0) {
    console.warn(`  -> CẢNH BÁO: ${unparsedDates} bài không đọc được CreateDate gốc, đã dùng ngày hiện tại thay thế.`);
  }
  console.warn(
    "  -> LƯU Ý: coverImageUrl giữ nguyên đường dẫn ảnh từ web cũ (vd /Uploads/...) — ẢNH CHƯA ĐƯỢC COPY SANG SERVER MỚI. " +
      "Cần copy thư mục ảnh web cũ sang server mới và/hoặc viết thêm bước xử lý riêng nếu muốn ảnh hiển thị đúng."
  );
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
