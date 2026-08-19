import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { DocumentTypeDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateDocumentTypeDto } from "./dto/create-document-type.dto";
import { UpdateDocumentTypeDto } from "./dto/update-document-type.dto";

function toDto(t: { id: string; name: string; description: string | null; parentId: string | null }): DocumentTypeDto {
  return { id: t.id, name: t.name, description: t.description, parentId: t.parentId };
}

@Injectable()
export class DocumentTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async list(): Promise<DocumentTypeDto[]> {
    const types = await this.prisma.documentType.findMany({ orderBy: { name: "asc" } });
    return types.map(toDto);
  }

  async findOne(id: string): Promise<DocumentTypeDto> {
    const type = await this.prisma.documentType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException("Không tìm thấy loại công văn.");
    return toDto(type);
  }

  async create(dto: CreateDocumentTypeDto, actorUserId: string): Promise<DocumentTypeDto> {
    const existing = await this.prisma.documentType.findFirst({ where: { name: dto.name } });
    if (existing) throw new ConflictException("Tên loại công văn đã tồn tại.");

    const type = await this.prisma.documentType.create({
      data: { name: dto.name, description: dto.description, parentId: dto.parentId }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "DocumentType", entityId: type.id });
    return toDto(type);
  }

  async update(id: string, dto: UpdateDocumentTypeDto, actorUserId: string): Promise<DocumentTypeDto> {
    await this.findOne(id);
    const type = await this.prisma.documentType.update({
      where: { id },
      data: { name: dto.name, description: dto.description, parentId: dto.parentId }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "DocumentType", entityId: id });
    return toDto(type);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    const [inUse, hasChildren] = await Promise.all([
      this.prisma.officialDocument.count({ where: { documentTypeId: id } }),
      this.prisma.documentType.count({ where: { parentId: id } })
    ]);
    if (inUse > 0) throw new ConflictException(`Không thể xoá — đang có ${inUse} công văn thuộc loại này.`);
    if (hasChildren > 0) throw new ConflictException(`Không thể xoá — đang có ${hasChildren} loại con thuộc loại này.`);

    await this.prisma.documentType.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "DocumentType", entityId: id });
  }
}
