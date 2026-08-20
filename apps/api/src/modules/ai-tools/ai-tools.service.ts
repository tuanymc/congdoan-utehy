import { Injectable, NotFoundException } from "@nestjs/common";
import type { AiToolResource } from "@prisma/client";
import type { AiToolResourceDto, PublicAiToolResourceDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateAiToolResourceDto } from "./dto/create-ai-tool-resource.dto";
import { UpdateAiToolResourceDto } from "./dto/update-ai-tool-resource.dto";

function toDto(item: AiToolResource): AiToolResourceDto {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    url: item.url,
    category: item.category,
    logoUrl: item.logoUrl,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function toPublicDto(item: AiToolResource): PublicAiToolResourceDto {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    url: item.url,
    category: item.category,
    logoUrl: item.logoUrl
  };
}

/**
 * "Kho công cụ AI" (Tiện ích số, Phase 4c) — CRUD phẳng, không phân trang (số lượng công cụ nhỏ, giống
 * DocumentType/HomeSlide/MenuItem). listPublic() phục vụ trang công khai yêu cầu đăng nhập (bất kỳ
 * role nào) — xem PublicAiToolsController dùng JwtAuthGuard đơn thuần, không permission riêng.
 */
@Injectable()
export class AiToolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async listForAdmin(): Promise<AiToolResourceDto[]> {
    const items = await this.prisma.aiToolResource.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    return items.map(toDto);
  }

  async findOne(id: string): Promise<AiToolResourceDto> {
    const item = await this.prisma.aiToolResource.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Không tìm thấy công cụ AI này.");
    return toDto(item);
  }

  async create(dto: CreateAiToolResourceDto, actorUserId: string): Promise<AiToolResourceDto> {
    const item = await this.prisma.aiToolResource.create({
      data: {
        name: dto.name,
        description: dto.description,
        url: dto.url,
        category: dto.category,
        logoUrl: dto.logoUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true
      }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "AiToolResource", entityId: item.id });
    return toDto(item);
  }

  async update(id: string, dto: UpdateAiToolResourceDto, actorUserId: string): Promise<AiToolResourceDto> {
    await this.findOne(id);
    const item = await this.prisma.aiToolResource.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        url: dto.url,
        category: dto.category,
        logoUrl: dto.logoUrl,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "AiToolResource", entityId: id });
    return toDto(item);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.aiToolResource.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "AiToolResource", entityId: id });
  }

  /** Công khai (yêu cầu đăng nhập ở tầng controller) — CHỈ công cụ isActive=true, sắp theo sortOrder. */
  async listPublic(): Promise<PublicAiToolResourceDto[]> {
    const items = await this.prisma.aiToolResource.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
    return items.map(toPublicDto);
  }
}
