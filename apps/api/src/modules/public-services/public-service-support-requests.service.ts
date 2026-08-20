import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { PublicServiceSupportRequestDto, PublicServiceSupportRequestStatus } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreatePublicServiceSupportRequestDto } from "./dto/create-public-service-support-request.dto";
import { UpdatePublicServiceSupportRequestDto } from "./dto/update-public-service-support-request.dto";

const supportRequestWithRelations = Prisma.validator<Prisma.PublicServiceSupportRequestDefaultArgs>()({
  include: { procedure: { select: { title: true } }, assignedTo: { select: { fullName: true } } }
});
type SupportRequestWithRelations = Prisma.PublicServiceSupportRequestGetPayload<typeof supportRequestWithRelations>;

function toDto(item: SupportRequestWithRelations): PublicServiceSupportRequestDto {
  return {
    id: item.id,
    fullName: item.fullName,
    phone: item.phone,
    email: item.email,
    procedureId: item.procedureId,
    procedureTitle: item.procedure?.title ?? null,
    procedureOther: item.procedureOther,
    stuckStep: item.stuckStep,
    description: item.description,
    status: item.status as PublicServiceSupportRequestStatus,
    assignedToUserId: item.assignedToUserId,
    assignedToName: item.assignedTo?.fullName ?? null,
    staffNote: item.staffNote,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

/**
 * Nhóm 4 ("Công đoàn hỗ trợ tôi") của "Dịch vụ công" — PHẦN NỔI BẬT NHẤT theo yêu cầu người quản trị.
 * submit() phục vụ form công khai (KHÔNG JWT, xem PublicServiceSupportRequestsController) — cùng chính
 * sách "không bắt buộc đăng nhập" như EventRegistration (4b)/SurveyResponse (4d). Các method còn lại
 * chỉ dùng ở trang quản trị triage (permission "publicservicesupportrequest:*").
 */
@Injectable()
export class PublicServiceSupportRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async listForAdmin(status?: string): Promise<PublicServiceSupportRequestDto[]> {
    const items = await this.prisma.publicServiceSupportRequest.findMany({
      where: status ? { status } : undefined,
      ...supportRequestWithRelations,
      orderBy: { createdAt: "desc" }
    });
    return items.map(toDto);
  }

  async findOne(id: string): Promise<PublicServiceSupportRequestDto> {
    const item = await this.prisma.publicServiceSupportRequest.findUnique({ where: { id }, ...supportRequestWithRelations });
    if (!item) throw new NotFoundException("Không tìm thấy yêu cầu hỗ trợ này.");
    return toDto(item);
  }

  async update(id: string, dto: UpdatePublicServiceSupportRequestDto, actorUserId: string): Promise<PublicServiceSupportRequestDto> {
    await this.findOne(id);
    const item = await this.prisma.publicServiceSupportRequest.update({
      where: { id },
      data: {
        status: dto.status,
        // dto.assignedToUserId === null -> bỏ phân công (set NULL); === undefined -> giữ nguyên (không
        // đổi field trong PATCH) — 2 giá trị này PHẢI phân biệt rõ, không gộp chung "?? undefined".
        assignedToUserId: dto.assignedToUserId === undefined ? undefined : dto.assignedToUserId,
        staffNote: dto.staffNote
      },
      ...supportRequestWithRelations
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "PublicServiceSupportRequest", entityId: id });
    return toDto(item);
  }

  /** Gửi yêu cầu hỗ trợ — công khai, không yêu cầu đăng nhập. Bắt buộc có ít nhất 1 trong 2 (phone/
   * email) để cán bộ Công đoàn có cách liên hệ lại (KHÔNG dùng CHECK constraint CSDL, validate ở đây
   * cho đơn giản, cùng chính sách các form công khai khác trong dự án). */
  async submit(dto: CreatePublicServiceSupportRequestDto): Promise<PublicServiceSupportRequestDto> {
    if (!dto.phone && !dto.email) {
      throw new BadRequestException("Vui lòng để lại số điện thoại hoặc email để Công đoàn liên hệ lại.");
    }

    if (dto.procedureId) {
      const procedure = await this.prisma.publicServiceProcedure.findFirst({
        where: { id: dto.procedureId, isActive: true }
      });
      if (!procedure) throw new BadRequestException("Thủ tục đã chọn không tồn tại hoặc chưa được công khai.");
    }

    const item = await this.prisma.publicServiceSupportRequest.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        procedureId: dto.procedureId,
        procedureOther: dto.procedureOther,
        stuckStep: dto.stuckStep,
        description: dto.description
      },
      ...supportRequestWithRelations
    });
    return toDto(item);
  }
}
