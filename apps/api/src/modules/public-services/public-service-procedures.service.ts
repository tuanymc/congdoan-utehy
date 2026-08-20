import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicServiceProcedure } from "@prisma/client";
import type {
  PublicServiceProcedureCategory,
  PublicServiceProcedureDetailDto,
  PublicServiceProcedureDto,
  PublicServiceProcedureListItemDto
} from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreatePublicServiceProcedureDto } from "./dto/create-public-service-procedure.dto";
import { UpdatePublicServiceProcedureDto } from "./dto/update-public-service-procedure.dto";

function toDto(item: PublicServiceProcedure): PublicServiceProcedureDto {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category as PublicServiceProcedureCategory,
    summary: item.summary,
    conditions: item.conditions,
    requiredDocuments: item.requiredDocuments,
    whereToApply: item.whereToApply,
    steps: item.steps,
    fee: item.fee,
    processingTime: item.processingTime,
    resultDelivery: item.resultDelivery,
    commonMistakes: item.commonMistakes,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function toListItemDto(item: PublicServiceProcedure): PublicServiceProcedureListItemDto {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category as PublicServiceProcedureCategory,
    summary: item.summary
  };
}

function toDetailDto(item: PublicServiceProcedure): PublicServiceProcedureDetailDto {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    category: item.category as PublicServiceProcedureCategory,
    summary: item.summary,
    conditions: item.conditions,
    requiredDocuments: item.requiredDocuments,
    whereToApply: item.whereToApply,
    steps: item.steps,
    fee: item.fee,
    processingTime: item.processingTime,
    resultDelivery: item.resultDelivery,
    commonMistakes: item.commonMistakes
  };
}

/**
 * Nhóm 1 (Tra cứu nhanh) + Nhóm 2 (Hướng dẫn từng bước) của "Dịch vụ công" (Tiện ích số, Phase 4e) —
 * CRUD phẳng, không phân trang (số lượng thủ tục nhỏ, giống AiToolResource). listPublic()/findBySlug()
 * phục vụ trang công khai (KHÔNG JWT) — CHỈ trả về thủ tục isActive=true (xem PublicServiceProceduresController).
 */
@Injectable()
export class PublicServiceProceduresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async listForAdmin(): Promise<PublicServiceProcedureDto[]> {
    const items = await this.prisma.publicServiceProcedure.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
    return items.map(toDto);
  }

  async findOne(id: string): Promise<PublicServiceProcedureDto> {
    const item = await this.prisma.publicServiceProcedure.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Không tìm thấy thủ tục này.");
    return toDto(item);
  }

  async create(dto: CreatePublicServiceProcedureDto, actorUserId: string): Promise<PublicServiceProcedureDto> {
    const item = await this.prisma.publicServiceProcedure.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        category: dto.category,
        summary: dto.summary,
        conditions: dto.conditions,
        requiredDocuments: dto.requiredDocuments,
        whereToApply: dto.whereToApply,
        steps: dto.steps,
        fee: dto.fee,
        processingTime: dto.processingTime,
        resultDelivery: dto.resultDelivery,
        commonMistakes: dto.commonMistakes,
        sortOrder: dto.sortOrder ?? 0,
        // Mặc định false (nháp) dù không truyền lên — khác AiToolResource (mặc định true) vì đây là nội
        // dung có thể ảnh hưởng pháp lý, cần cán bộ chủ động bật sau khi rà soát (xem ghi chú schema.prisma).
        isActive: dto.isActive ?? false
      }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "PublicServiceProcedure", entityId: item.id });
    return toDto(item);
  }

  async update(id: string, dto: UpdatePublicServiceProcedureDto, actorUserId: string): Promise<PublicServiceProcedureDto> {
    await this.findOne(id);
    const item = await this.prisma.publicServiceProcedure.update({
      where: { id },
      data: {
        slug: dto.slug,
        title: dto.title,
        category: dto.category,
        summary: dto.summary,
        conditions: dto.conditions,
        requiredDocuments: dto.requiredDocuments,
        whereToApply: dto.whereToApply,
        steps: dto.steps,
        fee: dto.fee,
        processingTime: dto.processingTime,
        resultDelivery: dto.resultDelivery,
        commonMistakes: dto.commonMistakes,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "PublicServiceProcedure", entityId: id });
    return toDto(item);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    // onDelete: SetNull trên PublicServiceSupportRequest.procedure (xem schema.prisma) — xoá thủ tục
    // không xoá lịch sử yêu cầu hỗ trợ đã gửi, chỉ mất liên kết procedureId, không cần tự dọn ở đây.
    await this.prisma.publicServiceProcedure.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "PublicServiceProcedure", entityId: id });
  }

  /** Công khai — CHỈ thủ tục isActive=true, lọc theo category nếu có (dùng cho lưới "Tra cứu nhanh"). */
  async listPublic(category?: string): Promise<PublicServiceProcedureListItemDto[]> {
    const items = await this.prisma.publicServiceProcedure.findMany({
      where: { isActive: true, ...(category ? { category } : {}) },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
    });
    return items.map(toListItemDto);
  }

  /** Công khai — tra theo slug, CHỈ thủ tục isActive=true. */
  async findPublicBySlug(slug: string): Promise<PublicServiceProcedureDetailDto> {
    const item = await this.prisma.publicServiceProcedure.findFirst({ where: { slug, isActive: true } });
    if (!item) throw new NotFoundException("Không tìm thấy thủ tục này.");
    return toDetailDto(item);
  }
}
