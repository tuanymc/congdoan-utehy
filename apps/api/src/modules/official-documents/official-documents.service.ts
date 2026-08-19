import { Injectable, NotFoundException } from "@nestjs/common";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import type {
  DocumentDirection,
  DocumentStatus,
  OfficialDocumentDetailDto,
  OfficialDocumentListItemDto,
  PaginatedResult,
  PaginationQuery,
  PublicOfficialDocumentDetailDto,
  PublicOfficialDocumentListItemDto
} from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateOfficialDocumentDto } from "./dto/create-official-document.dto";
import { UpdateOfficialDocumentDto } from "./dto/update-official-document.dto";

/**
 * DocumentAttachment.path giữ nguyên định dạng tương đối từ web cũ, ví dụ "DocumentFiles/admin/xxx.pdf"
 * (xem chú thích field `path` trong schema.prisma). Thư mục vật lý gộp từ 3 bản deploy web cũ trên
 * server mới lại đặt tên "document-files" — KHÔNG phải "DocumentFiles" (xem deploy guide Bước 6.5 mục
 * 3: `$dest = "...\document-files"`, robocopy COPY NỘI DUNG của DocumentFiles vào thẳng $dest, không
 * giữ tên thư mục gốc) — nên phải bỏ tiền tố "DocumentFiles/" khỏi path trước khi nối với
 * DOCUMENT_FILES_DIR mới ra đúng vị trí file thật trên đĩa.
 */
function resolveAttachmentPhysicalPath(baseDir: string, relPath: string): string {
  const stripped = relPath.replace(/^DocumentFiles[\\/]/i, "");
  const resolvedBase = resolve(baseDir);
  const resolvedPath = resolve(join(resolvedBase, stripped));
  // Chặn path traversal (vd relPath chứa "..") — giá trị hiện tại chỉ đến từ ETL đáng tin cậy, nhưng
  // kiểm tra lại cho an toàn nếu sau này cho phép nhập path thủ công qua admin.
  if (!resolvedPath.startsWith(resolvedBase)) {
    throw new NotFoundException("Đường dẫn file đính kèm không hợp lệ.");
  }
  return resolvedPath;
}

const documentWithRelations = Prisma.validator<Prisma.OfficialDocumentDefaultArgs>()({
  include: { documentType: true, attachments: true }
});
type DocumentWithRelations = Prisma.OfficialDocumentGetPayload<typeof documentWithRelations>;

function toListItem(d: DocumentWithRelations): OfficialDocumentListItemDto {
  return {
    id: d.id,
    title: d.title,
    documentNumber: d.documentNumber,
    direction: d.direction as DocumentDirection,
    status: d.status as DocumentStatus,
    documentType: {
      id: d.documentType.id,
      name: d.documentType.name,
      description: d.documentType.description,
      parentId: d.documentType.parentId
    },
    issuingOfficeName: d.issuingOfficeName,
    isPublic: d.isPublic,
    issuedAt: d.issuedAt ? d.issuedAt.toISOString() : null,
    createdAt: d.createdAt.toISOString()
  };
}

/** Biến thể công khai — CỐ Ý bỏ status/priority/createdByName/processedByNames/sentToRaw (xem
 * PublicOfficialDocumentListItemDto trong packages/types/src/official-document.ts). */
function toPublicListItem(d: DocumentWithRelations): PublicOfficialDocumentListItemDto {
  return {
    id: d.id,
    title: d.title,
    documentNumber: d.documentNumber,
    direction: d.direction as DocumentDirection,
    documentType: {
      id: d.documentType.id,
      name: d.documentType.name,
      description: d.documentType.description,
      parentId: d.documentType.parentId
    },
    issuingOfficeName: d.issuingOfficeName,
    issuedAt: d.issuedAt ? d.issuedAt.toISOString() : null
  };
}

function toPublicDetail(d: DocumentWithRelations): PublicOfficialDocumentDetailDto {
  return {
    ...toPublicListItem(d),
    content: d.content,
    summary: d.summary,
    attachments: d.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      description: a.description,
      path: a.path,
      uploadedAt: a.uploadedAt ? a.uploadedAt.toISOString() : null
    }))
  };
}

function toDetail(d: DocumentWithRelations): OfficialDocumentDetailDto {
  return {
    ...toListItem(d),
    content: d.content,
    summary: d.summary,
    priority: d.priority,
    sentAt: d.sentAt ? d.sentAt.toISOString() : null,
    receivedAt: d.receivedAt ? d.receivedAt.toISOString() : null,
    processStartAt: d.processStartAt ? d.processStartAt.toISOString() : null,
    processEndAt: d.processEndAt ? d.processEndAt.toISOString() : null,
    createdByName: d.createdByName,
    processedByNames: d.processedByNames,
    sentToRaw: d.sentToRaw,
    updatedAt: d.updatedAt.toISOString(),
    attachments: d.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      description: a.description,
      path: a.path,
      uploadedAt: a.uploadedAt ? a.uploadedAt.toISOString() : null
    }))
  };
}

/**
 * CRUD "Công văn" — các method không có hậu tố "Public" chỉ dùng ở trang quản trị (yêu cầu JWT +
 * permission "document:*"). Các method *Public() phục vụ PublicOfficialDocumentsController (route
 * công khai /official-documents, không JWT) — CHỈ trả công văn isPublic=true và lược bỏ field nội bộ,
 * xem PublicOfficialDocumentListItemDto/DetailDto trong packages/types/src/official-document.ts.
 * Xem đầu domain block OFFICIALDOCUMENT trong prisma/schema.prisma để biết vì sao field được đặt
 * tên/map như vậy (đối chiếu trực tiếp từ code web cũ CV2/Document/*.cs).
 */
@Injectable()
export class OfficialDocumentsService {
  /// Thư mục gốc chứa file đính kèm công văn đã gộp trên server (xem deploy guide Bước 6.5 mục 3).
  /// Mặc định "<cwd>/document-files" chỉ để chạy dev cục bộ không lỗi — trên server PHẢI đặt
  /// DOCUMENT_FILES_DIR trong .env trỏ đúng "C:\inetpub\congdoan2026\document-files".
  private readonly documentFilesDir = process.env.DOCUMENT_FILES_DIR ?? join(process.cwd(), "document-files");

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async list(
    query: PaginationQuery & { documentTypeId?: string; direction?: DocumentDirection; status?: DocumentStatus }
  ): Promise<PaginatedResult<OfficialDocumentListItemDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.OfficialDocumentWhereInput = {
      ...(query.documentTypeId ? { documentTypeId: query.documentTypeId } : {}),
      ...(query.direction ? { direction: query.direction } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search } },
              { documentNumber: { contains: query.search } },
              { content: { contains: query.search } }
            ]
          }
        : {})
    };

    const [total, documents] = await this.prisma.$transaction([
      this.prisma.officialDocument.count({ where }),
      this.prisma.officialDocument.findMany({
        where,
        ...documentWithRelations,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return { items: documents.map(toListItem), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string): Promise<OfficialDocumentDetailDto> {
    const document = await this.prisma.officialDocument.findUnique({ where: { id }, ...documentWithRelations });
    if (!document) throw new NotFoundException("Không tìm thấy công văn.");
    return toDetail(document);
  }

  /** Công khai — CHỈ trả công văn isPublic=true (khớp ShowWeb=1 web cũ), dùng cho trang "Văn bản". */
  async listPublic(
    query: PaginationQuery & { documentTypeId?: string; direction?: DocumentDirection }
  ): Promise<PaginatedResult<PublicOfficialDocumentListItemDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.OfficialDocumentWhereInput = {
      isPublic: true,
      ...(query.documentTypeId ? { documentTypeId: query.documentTypeId } : {}),
      ...(query.direction ? { direction: query.direction } : {}),
      ...(query.search
        ? { OR: [{ title: { contains: query.search } }, { documentNumber: { contains: query.search } }] }
        : {})
    };

    const [total, documents] = await this.prisma.$transaction([
      this.prisma.officialDocument.count({ where }),
      this.prisma.officialDocument.findMany({
        where,
        ...documentWithRelations,
        orderBy: { issuedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return { items: documents.map(toPublicListItem), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOnePublic(id: string): Promise<PublicOfficialDocumentDetailDto> {
    const document = await this.prisma.officialDocument.findFirst({
      where: { id, isPublic: true },
      ...documentWithRelations
    });
    if (!document) throw new NotFoundException("Không tìm thấy công văn.");
    return toPublicDetail(document);
  }

  async create(dto: CreateOfficialDocumentDto, actorUserId: string): Promise<OfficialDocumentDetailDto> {
    const document = await this.prisma.officialDocument.create({
      data: {
        title: dto.title,
        documentNumber: dto.documentNumber,
        content: dto.content,
        summary: dto.summary,
        direction: dto.direction ?? "DRAFT",
        status: dto.status ?? "SAVE_DRAFT",
        priority: dto.priority,
        isPublic: dto.isPublic ?? false,
        documentTypeId: dto.documentTypeId,
        issuingOfficeName: dto.issuingOfficeName,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        sentAt: dto.sentAt ? new Date(dto.sentAt) : undefined,
        receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : undefined,
        createdByName: null
      },
      ...documentWithRelations
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "OfficialDocument", entityId: document.id });
    return toDetail(document);
  }

  async update(id: string, dto: UpdateOfficialDocumentDto, actorUserId: string): Promise<OfficialDocumentDetailDto> {
    await this.findOne(id);
    const document = await this.prisma.officialDocument.update({
      where: { id },
      data: {
        title: dto.title,
        documentNumber: dto.documentNumber,
        content: dto.content,
        summary: dto.summary,
        direction: dto.direction,
        status: dto.status,
        priority: dto.priority,
        isPublic: dto.isPublic,
        documentTypeId: dto.documentTypeId,
        issuingOfficeName: dto.issuingOfficeName,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
        sentAt: dto.sentAt ? new Date(dto.sentAt) : undefined,
        receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : undefined
      },
      ...documentWithRelations
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "OfficialDocument", entityId: id });
    return toDetail(document);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.officialDocument.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "OfficialDocument", entityId: id });
  }

  /** Xác định file vật lý của 1 file đính kèm để controller stream về cho client tải xuống. */
  async getAttachmentForDownload(
    documentId: string,
    attachmentId: string
  ): Promise<{ fileName: string; physicalPath: string }> {
    const attachment = await this.prisma.documentAttachment.findFirst({
      where: { id: attachmentId, documentId }
    });
    if (!attachment) throw new NotFoundException("Không tìm thấy file đính kèm.");

    const physicalPath = resolveAttachmentPhysicalPath(this.documentFilesDir, attachment.path);
    if (!existsSync(physicalPath)) {
      throw new NotFoundException(
        "File đính kèm không tồn tại trên server — có thể chưa copy đủ thư mục DocumentFiles từ web cũ (xem deploy guide Bước 6.5 mục 3)."
      );
    }
    return { fileName: attachment.fileName, physicalPath };
  }

  /** Giống getAttachmentForDownload() ở trên, nhưng thêm điều kiện document.isPublic=true — chặn tải
   * file đính kèm của công văn nội bộ qua route công khai (route công khai KHÔNG có JWT/permission
   * guard bảo vệ, nên phải tự kiểm tra isPublic ngay trong service thay vì dựa vào guard). */
  async getPublicAttachmentForDownload(
    documentId: string,
    attachmentId: string
  ): Promise<{ fileName: string; physicalPath: string }> {
    const document = await this.prisma.officialDocument.findFirst({ where: { id: documentId, isPublic: true } });
    if (!document) throw new NotFoundException("Không tìm thấy công văn.");
    return this.getAttachmentForDownload(documentId, attachmentId);
  }
}
