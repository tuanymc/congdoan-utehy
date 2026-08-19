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
 * Script dùng upsert (theo slug với Post/Category, theo tra cứu legacyCode với DocumentType/
 * OfficialDocument/DocumentAttachment) nên chạy lại nhiều lần là AN TOÀN (idempotent), không tạo trùng.
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
  console.log("\n[1/5] Đang lấy danh sách chuyên mục (sp_tblCategory_GetByAll) từ web cũ...");
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
  console.log("\n[2/5] Đang lấy danh sách bài viết (sp_tblPost_GetByAll) từ web cũ...");
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
function mapStatus(raw: string | null, warnSet: Set<string>): string {
  const n = raw ? parseInt(raw.trim(), 10) : NaN;
  if (Number.isFinite(n) && STATUS_MAP[n]) return STATUS_MAP[n];
  if (raw) warnSet.add(raw);
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
  console.log("\n[3/5] Đang lấy danh sách loại công văn (tblDocumentKind) từ web cũ...");
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
    const name = (row.Name ?? "").trim() || `Loại công văn ${row.DocumentKindID}`;
    const legacyCode = String(row.DocumentKindID);

    if (DRY_RUN) {
      legacyToNewId.set(row.DocumentKindID, `dry-run-${legacyCode}`);
      continue;
    }

    const type = await upsertByLegacyCode(prisma.documentType, legacyCode, {
      name,
      description: row.Description?.trim() || null
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
  console.log("\n[4/5] Đang lấy danh sách công văn (tblDocument) từ web cũ — có thể mất chút thời gian với 2.494 dòng...");

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
    (officialsResult.recordset as Array<{ OfficalID: number; Name: string | null }>).map((o) => [
      o.OfficalID,
      o.Name ?? ""
    ])
  );
  const userNameById = new Map<number, string>(
    (usersResult.recordset as Array<{ UserID: number; FullName: string | null }>).map((u) => [
      u.UserID,
      u.FullName ?? ""
    ])
  );

  function resolveUserProcessNames(csv: string | null): string | null {
    if (!csv || !csv.trim()) return null;
    const names = csv
      .split(",")
      .map((s) => s.trim())
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
    const title = (row.Name ?? "").trim();
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
      documentNumber: row.DocumentNumber?.trim() || null,
      content: row.Content?.trim() || null,
      summary: row.Excerpt?.trim() || null,
      direction,
      status,
      priority: row.Priority?.trim() || null,
      isPublic: row.ShowWeb === 1,
      documentTypeId,
      issuingOfficeName: row.PublishOffical ? officeNameById.get(row.PublishOffical) ?? null : null,
      createdByName: row.IDUserCreate ? userNameById.get(row.IDUserCreate) ?? null : null,
      processedByNames: resolveUserProcessNames(row.UserProcess),
      sentToRaw: row.SendOfficals?.trim() || null,
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
  console.log("\n[5/5] Đang lấy danh sách file đính kèm công văn (tblAttach) từ web cũ...");
  const [attachResult, documentsResult] = await Promise.all([
    pool.request().query("SELECT AttachID, Name, Description, Path FROM tblAttach"),
    pool.request().query("SELECT DocumentID, Attachs FROM tblDocument WHERE Attachs IS NOT NULL AND Attachs <> '' AND Attachs <> ','")
  ]);

  const attachById = new Map<
    number,
    { Name: string | null; Description: string | null; Path: string | null }
  >(
    (attachResult.recordset as Array<{ AttachID: number; Name: string | null; Description: string | null; Path: string | null }>).map(
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

    const attachIds = (row.Attachs ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isFinite(n));

    for (const attachId of attachIds) {
      const attach = attachById.get(attachId);
      if (!attach || !attach.Path) {
        skippedNoAttach += 1;
        continue;
      }

      if (DRY_RUN) {
        imported += 1;
        continue;
      }

      await upsertByLegacyCode(prisma.documentAttachment, String(attachId), {
        fileName: attach.Name?.trim() || `file-${attachId}`,
        description: attach.Description?.trim() || null,
        path: attach.Path.trim(),
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
