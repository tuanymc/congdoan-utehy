import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  DocumentDirection,
  DocumentStatus,
  OfficialDocumentDetailDto,
  OfficialDocumentListItemDto,
  PaginatedResult,
  PaginationQuery
} from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateOfficialDocumentDto } from "./dto/create-official-document.dto";
import { UpdateOfficialDocumentDto } from "./dto/update-official-document.dto";

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
 * CRUD "Công văn" — chỉ dùng ở trang quản trị (không có endpoint công khai, khác với Content/Post).
 * Xem packages/types/src/official-document.ts và đầu domain block trong prisma/schema.prisma để
 * biết vì sao field được đặt tên/map như vậy (đối chiếu trực tiếp từ code web cũ CV2/Document/*.cs).
 */
@Injectable()
export class OfficialDocumentsService {
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
}
