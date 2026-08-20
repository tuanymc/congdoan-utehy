import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicServiceLink } from "@prisma/client";
import type { PublicServiceLinkDto, PublicServiceLinkPublicDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreatePublicServiceLinkDto } from "./dto/create-public-service-link.dto";
import { UpdatePublicServiceLinkDto } from "./dto/update-public-service-link.dto";

function toDto(item: PublicServiceLink): PublicServiceLinkDto {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    description: item.description,
    group: item.group,
    logoUrl: item.logoUrl,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function toPublicDto(item: PublicServiceLink): PublicServiceLinkPublicDto {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    description: item.description,
    group: item.group,
    logoUrl: item.logoUrl
  };
}

/**
 * Nhóm 3 (Kho biểu mẫu và đường dẫn chính thống) của "Dịch vụ công" — CRUD phẳng, không phân trang,
 * cùng khuôn AiToolsService. QR code sinh ở FE trực tiếp từ `url`, không xử lý gì thêm ở BE (xem ghi
 * chú model PublicServiceLink trong schema.prisma).
 */
@Injectable()
export class PublicServiceLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async listForAdmin(): Promise<PublicServiceLinkDto[]> {
    const items = await this.prisma.publicServiceLink.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
    return items.map(toDto);
  }

  async findOne(id: string): Promise<PublicServiceLinkDto> {
    const item = await this.prisma.publicServiceLink.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Không tìm thấy liên kết này.");
    return toDto(item);
  }

  async create(dto: CreatePublicServiceLinkDto, actorUserId: string): Promise<PublicServiceLinkDto> {
    const item = await this.prisma.publicServiceLink.create({
      data: {
        title: dto.title,
        url: dto.url,
        description: dto.description,
        group: dto.group,
        logoUrl: dto.logoUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true
      }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "PublicServiceLink", entityId: item.id });
    return toDto(item);
  }

  async update(id: string, dto: UpdatePublicServiceLinkDto, actorUserId: string): Promise<PublicServiceLinkDto> {
    await this.findOne(id);
    const item = await this.prisma.publicServiceLink.update({
      where: { id },
      data: {
        title: dto.title,
        url: dto.url,
        description: dto.description,
        group: dto.group,
        logoUrl: dto.logoUrl,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "PublicServiceLink", entityId: id });
    return toDto(item);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.publicServiceLink.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "PublicServiceLink", entityId: id });
  }

  /** Công khai — CHỈ liên kết isActive=true, sắp theo sortOrder. */
  async listPublic(): Promise<PublicServiceLinkPublicDto[]> {
    const items = await this.prisma.publicServiceLink.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
    });
    return items.map(toPublicDto);
  }
}
