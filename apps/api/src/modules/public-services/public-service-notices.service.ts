import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicServiceNotice } from "@prisma/client";
import type { PublicServiceNoticeCategory, PublicServiceNoticeDto, PublicServiceNoticePublicDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreatePublicServiceNoticeDto } from "./dto/create-public-service-notice.dto";
import { UpdatePublicServiceNoticeDto } from "./dto/update-public-service-notice.dto";

function toDto(item: PublicServiceNotice): PublicServiceNoticeDto {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    category: item.category as PublicServiceNoticeCategory | null,
    isPinned: item.isPinned,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function toPublicDto(item: PublicServiceNotice): PublicServiceNoticePublicDto {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    category: item.category as PublicServiceNoticeCategory | null,
    isPinned: item.isPinned,
    createdAt: item.createdAt.toISOString()
  };
}

/**
 * Nhóm 5 (Cảnh báo và nhắc việc) của "Dịch vụ công" — bảng tin CHUNG do cán bộ đăng, KHÔNG cá nhân hoá
 * (xem ghi chú model PublicServiceNotice trong schema.prisma). CRUD phẳng, không phân trang.
 */
@Injectable()
export class PublicServiceNoticesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async listForAdmin(): Promise<PublicServiceNoticeDto[]> {
    const items = await this.prisma.publicServiceNotice.findMany({ orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] });
    return items.map(toDto);
  }

  async findOne(id: string): Promise<PublicServiceNoticeDto> {
    const item = await this.prisma.publicServiceNotice.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Không tìm thấy thông báo này.");
    return toDto(item);
  }

  async create(dto: CreatePublicServiceNoticeDto, actorUserId: string): Promise<PublicServiceNoticeDto> {
    const item = await this.prisma.publicServiceNotice.create({
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        isPinned: dto.isPinned ?? false,
        isActive: dto.isActive ?? true
      }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "PublicServiceNotice", entityId: item.id });
    return toDto(item);
  }

  async update(id: string, dto: UpdatePublicServiceNoticeDto, actorUserId: string): Promise<PublicServiceNoticeDto> {
    await this.findOne(id);
    const item = await this.prisma.publicServiceNotice.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        isPinned: dto.isPinned,
        isActive: dto.isActive
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "PublicServiceNotice", entityId: id });
    return toDto(item);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.publicServiceNotice.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "PublicServiceNotice", entityId: id });
  }

  /** Công khai — CHỈ thông báo isActive=true, ghim lên đầu, mới nhất trước. */
  async listPublic(): Promise<PublicServiceNoticePublicDto[]> {
    const items = await this.prisma.publicServiceNotice.findMany({
      where: { isActive: true },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }]
    });
    return items.map(toPublicDto);
  }
}
