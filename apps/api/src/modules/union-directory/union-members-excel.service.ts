import { BadRequestException, Injectable } from "@nestjs/common";
import ExcelJS from "exceljs";
import type { UnionMemberImportResultDto, UnionMemberImportRowError } from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";

/** Tối thiểu những field cần đọc từ file multer — cùng lý do/khuôn như UploadedAttachmentFile trong
 * official-documents.service.ts (tự khai báo thay vì thêm dependency @types/multer chỉ vì 1 type),
 * khai báo riêng ở đây thay vì import cross-module để giữ mỗi module độc lập. */
export interface UploadedExcelFile {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}

const MAX_IMPORT_FILE_SIZE_BYTES = 15 * 1024 * 1024;

const excelMemberWithRelations = Prisma.validator<Prisma.UnionMemberDefaultArgs>()({
  include: { department: true, profile: true }
});
type ExcelMemberWithRelations = Prisma.UnionMemberGetPayload<typeof excelMemberWithRelations>;

type ColumnType = "text" | "date" | "number" | "boolean";

interface ProfileColumnDef {
  key: string;
  header: string;
  type: ColumnType;
}

/** Toàn bộ ~90 field hồ sơ nội bộ, ĐÚNG THỨ TỰ + nhãn tiếng Việt khớp PROFILE_GROUPS trong
 * apps/admin/src/pages/union-members/UnionMemberForm.tsx — cố tình khớp để admin quen mặt chữ dùng
 * chung giữa 2 màn hình (form chi tiết + Excel). Field name khớp 1-1 với UnionMemberProfile trong
 * prisma/schema.prisma (xem toProfileDto trong union-members.service.ts). */
const PROFILE_COLUMNS: ProfileColumnDef[] = [
  // --- Thông tin cá nhân ---
  { key: "alias", header: "Bí danh", type: "text" },
  { key: "gender", header: "Giới tính", type: "text" },
  { key: "dateOfBirth", header: "Ngày sinh", type: "date" },
  { key: "placeOfBirth", header: "Nơi sinh", type: "text" },
  { key: "idCardNumber", header: "Số CMND/CCCD", type: "text" },
  { key: "idCardIssuedDate", header: "Ngày cấp CMND/CCCD", type: "date" },
  { key: "idCardIssuedPlace", header: "Nơi cấp CMND/CCCD", type: "text" },
  { key: "ethnicity", header: "Dân tộc", type: "text" },
  { key: "religion", header: "Tôn giáo", type: "text" },
  { key: "nationality", header: "Quốc tịch", type: "text" },
  { key: "hometown", header: "Quê quán", type: "text" },
  { key: "permanentAddress", header: "Địa chỉ thường trú", type: "text" },
  { key: "currentAddress", header: "Nơi ở hiện nay", type: "text" },
  { key: "contactAddress", header: "Địa chỉ liên lạc", type: "text" },
  { key: "officePhone", header: "Điện thoại cơ quan", type: "text" },
  { key: "homePhone", header: "Điện thoại nhà riêng", type: "text" },
  { key: "maritalStatus", header: "Tình trạng hôn nhân", type: "text" },
  { key: "familyBackground", header: "Thành phần xuất thân", type: "text" },
  { key: "familyPriorityGroup", header: "Diện ưu tiên gia đình", type: "text" },
  { key: "selfPriorityGroup", header: "Diện ưu tiên bản thân", type: "text" },
  { key: "talent", header: "Năng khiếu", type: "text" },
  { key: "healthStatus", header: "Tình trạng sức khoẻ", type: "text" },
  { key: "bloodType", header: "Nhóm máu", type: "text" },
  { key: "heightCm", header: "Chiều cao (cm)", type: "number" },
  { key: "weightKg", header: "Cân nặng (kg)", type: "number" },
  { key: "disability", header: "Khuyết tật", type: "text" },

  // --- Công tác ---
  { key: "facultyOrDepartmentLabel", header: "Phòng/Ban/Khoa công tác", type: "text" },
  { key: "workUnit", header: "Bộ phận công tác", type: "text" },
  { key: "decisionNumber", header: "Số quyết định", type: "text" },
  { key: "joinedEducationSectorDate", header: "Ngày vào ngành giáo dục", type: "date" },
  { key: "contractDate", header: "Ngày hợp đồng", type: "date" },
  { key: "recruitmentDate", header: "Ngày tuyển dụng", type: "date" },
  { key: "joinedAgencyDate", header: "Ngày vào cơ quan", type: "date" },
  { key: "recruitmentMethod", header: "Hình thức tuyển dụng", type: "text" },
  { key: "recruitingAgency", header: "Cơ quan tuyển dụng", type: "text" },
  { key: "assignedJob", header: "Công việc được giao", type: "text" },
  { key: "currentJob", header: "Công việc hiện nay", type: "text" },

  // --- Đảng ---
  { key: "partyCandidateDate", header: "Ngày vào Đảng (dự bị)", type: "date" },
  { key: "partyOfficialDate", header: "Ngày chính thức vào Đảng", type: "date" },
  { key: "partyJoinedPlace", header: "Nơi vào Đảng", type: "text" },
  { key: "partyPosition", header: "Chức vụ Đảng", type: "text" },
  { key: "partyLeftDate", header: "Ngày ra Đảng", type: "date" },
  { key: "partyCardNumber", header: "Số thẻ Đảng", type: "text" },
  { key: "partyCell", header: "Chi bộ", type: "text" },

  // --- Đoàn Thanh niên ---
  { key: "youthUnionJoinedDate", header: "Ngày vào Đoàn", type: "date" },
  { key: "youthUnionJoinedPlace", header: "Nơi vào Đoàn", type: "text" },
  { key: "youthUnionPosition", header: "Chức vụ Đoàn", type: "text" },

  // --- Công đoàn ---
  { key: "unionJoinedDate", header: "Ngày vào Công đoàn", type: "date" },
  { key: "unionJoinedPlace", header: "Nơi vào Công đoàn", type: "text" },
  { key: "unionPosition", header: "Chức vụ Công đoàn", type: "text" },
  { key: "unionSectionLabel", header: "Công đoàn bộ phận (nhãn gốc web cũ)", type: "text" },

  // --- Học vấn / Đào tạo ---
  { key: "generalEducationLevel", header: "Trình độ học vấn", type: "text" },
  { key: "hasGraduated", header: "Đã tốt nghiệp", type: "boolean" },
  { key: "trainingField", header: "Ngành đào tạo", type: "text" },
  { key: "trainingMajor", header: "Chuyên ngành đào tạo", type: "text" },
  { key: "trainingPlace", header: "Nơi đào tạo", type: "text" },
  { key: "trainingMethod", header: "Hình thức đào tạo", type: "text" },
  { key: "graduationYear", header: "Năm tốt nghiệp", type: "number" },
  { key: "hasPedagogyTraining", header: "Đã bồi dưỡng nghiệp vụ sư phạm", type: "boolean" },
  { key: "politicalTheoryLevel", header: "Trình độ lý luận chính trị", type: "text" },
  { key: "stateManagementLevel", header: "Trình độ quản lý nhà nước", type: "text" },
  { key: "educationManagementLevel", header: "Trình độ quản lý giáo dục", type: "text" },
  { key: "mainForeignLanguage", header: "Ngoại ngữ chính", type: "text" },
  { key: "foreignLanguageLevel", header: "Trình độ ngoại ngữ", type: "text" },
  { key: "otherForeignLanguage", header: "Ngoại ngữ khác", type: "text" },
  { key: "itLevel", header: "Trình độ tin học", type: "text" },

  // --- Lương / BHXH / trạng thái công tác ---
  { key: "salaryNote", header: "Ghi chú lương", type: "text" },
  { key: "seniorityNote", header: "Ghi chú thâm niên", type: "text" },
  { key: "jobTitle", header: "Chức danh nghề nghiệp", type: "text" },
  { key: "salaryGrade", header: "Ngạch lương", type: "text" },
  { key: "laborType", header: "Hình thức lao động", type: "text" },
  { key: "socialInsuranceNumber", header: "Số BHXH", type: "text" },
  { key: "oldSocialInsuranceNumber", header: "Số BHXH cũ", type: "text" },
  { key: "retirementDate", header: "Ngày nghỉ hưu", type: "date" },
  { key: "incomingStatus", header: "Trạng thái đến (đơn vị)", type: "text" },
  { key: "incomingDate", header: "Ngày chuyển đến", type: "date" },
  { key: "outgoingStatus", header: "Trạng thái đi (đơn vị)", type: "text" },
  { key: "outgoingDate", header: "Ngày chuyển đi", type: "date" },

  // --- Mã tra cứu nội bộ khác ---
  { key: "salaryCode", header: "Mã lương nhân viên", type: "text" },
  { key: "fileCode", header: "Mã hồ sơ nhân viên", type: "text" },
  { key: "unitLabel", header: "Đơn vị (donvi, web cũ)", type: "text" }
];

/** Cột "lõi" UnionMember — xử lý riêng (không dùng vòng lặp PROFILE_COLUMNS) vì mỗi cột có luật quy
 * đổi khác nhau (departmentName tra cứu ngược ra id, isPublic Có/Không, legacyCode là khoá đối chiếu
 * import). "ID hệ thống" chỉ để admin đối chiếu/tra cứu thủ công, KHÔNG dùng để khớp khi import (xem
 * UnionMembersExcelService.importFromBuffer — chỉ khớp theo Mã cán bộ, đúng lựa chọn khi thiết kế). */
const CORE_HEADERS = {
  legacyCode: "Mã cán bộ",
  fullName: "Họ và tên",
  photoUrl: "Ảnh đại diện (đường dẫn)",
  degreeLabel: "Trình độ chuyên môn cao nhất",
  positionTitle: "Chức vụ",
  phone: "Điện thoại",
  email: "Email",
  departmentName: "Công đoàn bộ phận",
  isPublic: "Hiển thị công khai (Có/Không)",
  sortOrder: "Thứ tự hiển thị",
  id: "ID hệ thống (không sửa)"
} as const;

/** exceljs Cell.value có thể là string/number/boolean/Date/null hoặc object (rich text, hyperlink,
 * formula result) tuỳ định dạng cell — quy hết về string an toàn cho cột kiểu text. */
function cellToText(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === "object") {
    const obj = raw as { text?: unknown; result?: unknown; richText?: Array<{ text?: string }> };
    if (Array.isArray(obj.richText)) return obj.richText.map((r) => r.text ?? "").join("");
    if (typeof obj.text === "string") return obj.text;
    if (obj.result !== undefined) return cellToText(obj.result);
    return "";
  }
  return String(raw).trim();
}

const TRUTHY_TEXT = new Set(["có", "co", "true", "1", "x", "yes"]);
const FALSY_TEXT = new Set(["không", "khong", "false", "0"]);

/** Ô trống (null/undefined/chuỗi rỗng sau trim) luôn trả về null cho MỌI kiểu cột — quy ước xuyên suốt
 * import Excel: import lại đè NGUYÊN VẸN theo nội dung file, ô trống nghĩa là xoá field đó về null
 * (khớp với cách export: field null cũng xuất ra ô trống) — khác quy ước "không gửi field = giữ
 * nguyên" của UnionMemberForm.tsx vì Excel không có khái niệm "không gửi", mọi ô đều có giá trị hiện
 * diện (kể cả rỗng). */
function parseCell(raw: unknown, type: ColumnType): string | number | boolean | Date | null {
  if (type === "text") {
    const text = cellToText(raw);
    return text === "" ? null : text;
  }
  if (raw === null || raw === undefined || raw === "") return null;

  if (type === "date") {
    if (raw instanceof Date) return raw;
    const text = cellToText(raw);
    if (!text) return null;
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (type === "number") {
    const n = typeof raw === "number" ? raw : Number(cellToText(raw));
    return Number.isFinite(n) ? n : null;
  }
  // boolean
  const normalized = cellToText(raw).toLowerCase();
  if (TRUTHY_TEXT.has(normalized)) return true;
  if (FALSY_TEXT.has(normalized)) return false;
  return null;
}

function profileValueForExport(raw: unknown, type: ColumnType): string | number | boolean | Date | null {
  if (raw === null || raw === undefined) return type === "boolean" ? "" : null;
  if (type === "boolean") return raw ? "Có" : "Không";
  if (type === "date" && raw instanceof Date) return raw;
  return raw as string | number;
}

/**
 * Export/import Excel (.xlsx) toàn bộ danh bạ + hồ sơ nội bộ công đoàn viên — bổ sung "cập nhật thông
 * tin công đoàn viên nhanh chóng và chuyên nghiệp" (yêu cầu người dùng). Theo lựa chọn khi thiết kế:
 * (1) đầy đủ ~90 field hồ sơ nội bộ (không chỉ field cơ bản), (2) khớp dòng theo Mã cán bộ
 * (UnionMember.legacyCode) — khớp thì cập nhật, KHÔNG khớp (hoặc để trống) thì TẠO MỚI luôn, không
 * skip. Tách riêng khỏi UnionMembersService để service đó không phình to vì logic thao tác file.
 */
@Injectable()
export class UnionMembersExcelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async exportToBuffer(): Promise<Buffer> {
    const members = await this.prisma.unionMember.findMany({
      ...excelMemberWithRelations,
      orderBy: [{ sortOrder: "asc" }, { fullName: "asc" }]
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hệ thống quản trị Công đoàn UTEHY";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Công đoàn viên");
    sheet.columns = [
      { header: CORE_HEADERS.legacyCode, key: "legacyCode", width: 14 },
      { header: CORE_HEADERS.fullName, key: "fullName", width: 26 },
      { header: CORE_HEADERS.photoUrl, key: "photoUrl", width: 30 },
      { header: CORE_HEADERS.degreeLabel, key: "degreeLabel", width: 22 },
      { header: CORE_HEADERS.positionTitle, key: "positionTitle", width: 22 },
      { header: CORE_HEADERS.phone, key: "phone", width: 16 },
      { header: CORE_HEADERS.email, key: "email", width: 26 },
      { header: CORE_HEADERS.departmentName, key: "departmentName", width: 24 },
      { header: CORE_HEADERS.isPublic, key: "isPublic", width: 14 },
      { header: CORE_HEADERS.sortOrder, key: "sortOrder", width: 10 },
      ...PROFILE_COLUMNS.map((c) => ({
        header: c.header,
        key: c.key,
        width: c.type === "text" ? 22 : 16,
        style: c.type === "date" ? { numFmt: "dd/mm/yyyy" } : undefined
      })),
      { header: CORE_HEADERS.id, key: "id", width: 38 }
    ];

    for (const m of members as ExcelMemberWithRelations[]) {
      const row: Record<string, unknown> = {
        legacyCode: m.legacyCode ?? "",
        fullName: m.fullName,
        photoUrl: m.photoUrl ?? "",
        degreeLabel: m.degreeLabel ?? "",
        positionTitle: m.positionTitle ?? "",
        phone: m.phone ?? "",
        email: m.email ?? "",
        departmentName: m.department?.name ?? "",
        isPublic: m.isPublic ? "Có" : "Không",
        sortOrder: m.sortOrder,
        id: m.id
      };
      for (const col of PROFILE_COLUMNS) {
        const raw = m.profile ? (m.profile as unknown as Record<string, unknown>)[col.key] : null;
        row[col.key] = profileValueForExport(raw, col.type);
      }
      sheet.addRow(row);
    }

    // Định dạng "chuyên nghiệp": in đậm + đóng băng dòng tiêu đề, auto-filter toàn bộ cột.
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columns.length } };

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  async importFromBuffer(file: UploadedExcelFile, actorUserId: string): Promise<UnionMemberImportResultDto> {
    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      throw new BadRequestException("File Excel vượt quá dung lượng cho phép (tối đa 15MB).");
    }

    const workbook = new ExcelJS.Workbook();
    try {
      // exceljs's bundled .d.ts khai báo 1 interface "Buffer" cục bộ riêng (chỉ extends ArrayBuffer,
      // không khớp Buffer thật của Node/@types/node hiện đại) che khuất Buffer global ngay trong phạm
      // vi file .d.ts đó — ép kiểu qua tham số suy ra từ chính hàm load() để không cần gọi thẳng tên
      // "Buffer" bị đụng độ, đây là hạn chế đã biết của exceljs, không phải lỗi ở buffer thật truyền vào.
      await workbook.xlsx.load(file.buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    } catch {
      throw new BadRequestException("Không đọc được file — hãy chắc chắn đây là file Excel (.xlsx) hợp lệ.");
    }
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new BadRequestException("File Excel không có sheet dữ liệu nào.");
    }

    const headerRow = sheet.getRow(1);
    const headerToColumn = new Map<string, number>();
    headerRow.eachCell((cell, colNumber) => {
      const text = cellToText(cell.value).trim();
      if (text) headerToColumn.set(text, colNumber);
    });

    const coreColumns: Partial<Record<keyof typeof CORE_HEADERS, number>> = {};
    for (const [key, header] of Object.entries(CORE_HEADERS)) {
      const colNumber = headerToColumn.get(header);
      if (colNumber) coreColumns[key as keyof typeof CORE_HEADERS] = colNumber;
    }
    if (!coreColumns.fullName) {
      throw new BadRequestException(
        `Không tìm thấy cột "${CORE_HEADERS.fullName}" — hãy tải file mẫu mới nhất qua nút "Xuất Excel" rồi chỉnh sửa trên đó, không đổi tên cột.`
      );
    }

    const resolvedProfileColumns = PROFILE_COLUMNS.map((c) => ({ ...c, colIndex: headerToColumn.get(c.header) })).filter(
      (c): c is ProfileColumnDef & { colIndex: number } => c.colIndex !== undefined
    );

    const departments = await this.prisma.unionDepartment.findMany({ select: { id: true, name: true } });
    const departmentIdByName = new Map(
      departments.map((d: { id: string; name: string }) => [d.name.trim().toLowerCase(), d.id])
    );

    let created = 0;
    let updated = 0;
    const errors: UnionMemberImportRowError[] = [];
    let processedRows = 0;

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      // exceljs vẫn trả về Row cho những dòng trống hoàn toàn nằm giữa dữ liệu (do người dùng chèn
      // dòng trắng) — bỏ qua, không tính là lỗi.
      if (row.cellCount === 0 || row.values === undefined || (Array.isArray(row.values) && row.values.every((v) => v === null || v === undefined || v === ""))) {
        continue;
      }

      const readCore = (key: keyof typeof CORE_HEADERS): unknown => {
        const colIndex = coreColumns[key];
        return colIndex ? row.getCell(colIndex).value : undefined;
      };

      try {
        const fullName = cellToText(readCore("fullName"));
        if (!fullName) {
          errors.push({ row: rowNumber, message: `Thiếu "${CORE_HEADERS.fullName}".` });
          continue;
        }
        processedRows++;

        const legacyCodeRaw = cellToText(readCore("legacyCode"));
        const legacyCode = legacyCodeRaw || null;

        const departmentNameRaw = cellToText(readCore("departmentName"));
        const departmentId = departmentNameRaw ? (departmentIdByName.get(departmentNameRaw.toLowerCase()) ?? null) : null;

        const isPublicRaw = parseCell(readCore("isPublic"), "boolean");
        const sortOrderRaw = parseCell(readCore("sortOrder"), "number");

        const coreData = {
          fullName,
          photoUrl: parseCell(readCore("photoUrl"), "text") as string | null,
          degreeLabel: parseCell(readCore("degreeLabel"), "text") as string | null,
          positionTitle: parseCell(readCore("positionTitle"), "text") as string | null,
          phone: parseCell(readCore("phone"), "text") as string | null,
          email: parseCell(readCore("email"), "text") as string | null,
          departmentId,
          isPublic: isPublicRaw === null ? true : isPublicRaw,
          sortOrder: sortOrderRaw === null ? 0 : sortOrderRaw
        };

        const profileData: Record<string, unknown> = {};
        for (const col of resolvedProfileColumns) {
          profileData[col.key] = parseCell(row.getCell(col.colIndex).value, col.type);
        }

        const existing = legacyCode ? await this.prisma.unionMember.findFirst({ where: { legacyCode }, select: { id: true } }) : null;

        if (existing) {
          await this.prisma.unionMember.update({
            where: { id: existing.id },
            data: {
              ...coreData,
              profile: {
                upsert: {
                  create: profileData as unknown as Prisma.UnionMemberProfileCreateWithoutMemberInput,
                  update: profileData as unknown as Prisma.UnionMemberProfileUpdateWithoutMemberInput
                }
              }
            }
          });
          updated++;
        } else {
          await this.prisma.unionMember.create({
            data: {
              ...coreData,
              legacyCode,
              profile: { create: profileData as unknown as Prisma.UnionMemberProfileCreateWithoutMemberInput }
            }
          });
          created++;
        }
      } catch (err) {
        errors.push({ row: rowNumber, message: err instanceof Error ? err.message : "Lỗi không xác định khi lưu dòng này." });
      }
    }

    await this.auditLog.record({
      actorUserId,
      action: "import",
      entityType: "UnionMember",
      entityId: `bulk (${created} tạo mới, ${updated} cập nhật, ${errors.length} lỗi)`
    });

    return { totalRows: processedRows, created, updated, errors };
  }
}
