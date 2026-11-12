import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  UNION_MEMBER_PROFILE_CHANGE_STATUSES,
  type MyUnionMemberDto,
  type UnionMemberProfileChangeRequestDto,
  type UnionMemberProfileChangeStatus
} from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { SubmitProfileChangeDto } from "./dto/submit-profile-change.dto";

const requestWithRelations = Prisma.validator<Prisma.UnionMemberProfileChangeRequestDefaultArgs>()({
  include: {
    member: { include: { department: true } },
    requestedBy: { select: { fullName: true } },
    reviewedBy: { select: { fullName: true } }
  }
});
type RequestWithRelations = Prisma.UnionMemberProfileChangeRequestGetPayload<typeof requestWithRelations>;

function toStatus(value: string): UnionMemberProfileChangeStatus {
  return UNION_MEMBER_PROFILE_CHANGE_STATUSES.includes(value as UnionMemberProfileChangeStatus)
    ? (value as UnionMemberProfileChangeStatus)
    : "PENDING";
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function toChangeRequestDto(row: RequestWithRelations): UnionMemberProfileChangeRequestDto {
  return {
    id: row.id,
    memberId: row.memberId,
    memberFullName: row.member.fullName,
    memberLegacyCode: row.member.legacyCode,
    departmentName: row.member.department?.name ?? null,
    photoUrl: row.photoUrl,
    positionTitle: row.positionTitle,
    degreeLabel: row.degreeLabel,
    currentPhotoUrl: row.currentPhotoUrl,
    currentPositionTitle: row.currentPositionTitle,
    currentDegreeLabel: row.currentDegreeLabel,
    status: toStatus(row.status),
    reviewNote: row.reviewNote,
    reviewedByName: row.reviewedBy?.fullName ?? null,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString()
  };
}

@Injectable()
export class UnionMemberProfileChangeRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async findPendingForMember(memberId: string): Promise<UnionMemberProfileChangeRequestDto | null> {
    const row = await this.prisma.unionMemberProfileChangeRequest.findFirst({
      where: { memberId, status: "PENDING" },
      ...requestWithRelations,
      orderBy: { createdAt: "desc" }
    });
    return row ? toChangeRequestDto(row) : null;
  }

  async listForAdmin(): Promise<UnionMemberProfileChangeRequestDto[]> {
    const rows = await this.prisma.unionMemberProfileChangeRequest.findMany({
      ...requestWithRelations,
      orderBy: { createdAt: "desc" }
    });
    return rows.map(toChangeRequestDto);
  }

  async submit(userId: string, dto: SubmitProfileChangeDto): Promise<MyUnionMemberDto> {
    const member = await this.prisma.unionMember.findFirst({
      where: { userId },
      include: { department: true }
    });
    if (!member) {
      throw new NotFoundException(
        "Tài khoản của bạn chưa được liên kết với hồ sơ công đoàn viên nào. Vui lòng liên hệ quản trị viên."
      );
    }

    const photoUrl = dto.photoUrl === undefined ? undefined : emptyToNull(dto.photoUrl);
    const positionTitle = dto.positionTitle === undefined ? undefined : emptyToNull(dto.positionTitle);
    const degreeLabel = dto.degreeLabel === undefined ? undefined : emptyToNull(dto.degreeLabel);

    if (photoUrl === undefined && positionTitle === undefined && degreeLabel === undefined) {
      throw new BadRequestException("Cần gửi ít nhất một thay đổi: ảnh, chức vụ hoặc trình độ.");
    }

    const pending = await this.prisma.unionMemberProfileChangeRequest.findFirst({
      where: { memberId: member.id, status: "PENDING" }
    });

    const data = {
      photoUrl: photoUrl === undefined ? (pending?.photoUrl ?? member.photoUrl) : photoUrl,
      positionTitle: positionTitle === undefined ? (pending?.positionTitle ?? member.positionTitle) : positionTitle,
      degreeLabel: degreeLabel === undefined ? (pending?.degreeLabel ?? member.degreeLabel) : degreeLabel,
      currentPhotoUrl: member.photoUrl,
      currentPositionTitle: member.positionTitle,
      currentDegreeLabel: member.degreeLabel
    };

    if (pending) {
      await this.prisma.unionMemberProfileChangeRequest.update({
        where: { id: pending.id },
        data
      });
    } else {
      await this.prisma.unionMemberProfileChangeRequest.create({
        data: {
          memberId: member.id,
          requestedByUserId: userId,
          ...data
        }
      });
    }

    return this.toMyDto(member.id);
  }

  async cancelPending(userId: string): Promise<MyUnionMemberDto> {
    const member = await this.prisma.unionMember.findFirst({ where: { userId }, select: { id: true } });
    if (!member) {
      throw new NotFoundException(
        "Tài khoản của bạn chưa được liên kết với hồ sơ công đoàn viên nào. Vui lòng liên hệ quản trị viên."
      );
    }
    const pending = await this.prisma.unionMemberProfileChangeRequest.findFirst({
      where: { memberId: member.id, status: "PENDING" }
    });
    if (!pending) {
      throw new NotFoundException("Không có yêu cầu nào đang chờ duyệt.");
    }
    await this.prisma.unionMemberProfileChangeRequest.delete({ where: { id: pending.id } });
    return this.toMyDto(member.id);
  }

  async approve(id: string, actorUserId: string, reviewNote?: string): Promise<UnionMemberProfileChangeRequestDto> {
    const row = await this.findPendingOrThrow(id);
    await this.prisma.$transaction([
      this.prisma.unionMember.update({
        where: { id: row.memberId },
        data: {
          photoUrl: row.photoUrl,
          positionTitle: row.positionTitle,
          degreeLabel: row.degreeLabel
        }
      }),
      this.prisma.unionMemberProfileChangeRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewNote: emptyToNull(reviewNote),
          reviewedByUserId: actorUserId,
          reviewedAt: new Date()
        }
      })
    ]);
    await this.auditLog.record({
      actorUserId,
      action: "update",
      entityType: "UnionMemberProfileChangeRequest",
      entityId: id
    });
    return this.findOneOrThrow(id);
  }

  async reject(id: string, actorUserId: string, reviewNote?: string): Promise<UnionMemberProfileChangeRequestDto> {
    await this.findPendingOrThrow(id);
    await this.prisma.unionMemberProfileChangeRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewNote: emptyToNull(reviewNote),
        reviewedByUserId: actorUserId,
        reviewedAt: new Date()
      }
    });
    await this.auditLog.record({
      actorUserId,
      action: "update",
      entityType: "UnionMemberProfileChangeRequest",
      entityId: id
    });
    return this.findOneOrThrow(id);
  }

  private async findPendingOrThrow(id: string) {
    const row = await this.prisma.unionMemberProfileChangeRequest.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy yêu cầu cập nhật hồ sơ.");
    if (row.status !== "PENDING") {
      throw new BadRequestException("Yêu cầu này đã được xử lý.");
    }
    return row;
  }

  private async findOneOrThrow(id: string): Promise<UnionMemberProfileChangeRequestDto> {
    const row = await this.prisma.unionMemberProfileChangeRequest.findUnique({
      where: { id },
      ...requestWithRelations
    });
    if (!row) throw new NotFoundException("Không tìm thấy yêu cầu cập nhật hồ sơ.");
    return toChangeRequestDto(row);
  }

  async toMyDto(memberId: string): Promise<MyUnionMemberDto> {
    const member = await this.prisma.unionMember.findUnique({
      where: { id: memberId },
      include: { department: true }
    });
    if (!member) throw new NotFoundException("Không tìm thấy hồ sơ công đoàn viên.");
    const pending = await this.findPendingForMember(memberId);
    return {
      id: member.id,
      fullName: member.fullName,
      photoUrl: member.photoUrl,
      degreeLabel: member.degreeLabel,
      positionTitle: member.positionTitle,
      phone: member.phone,
      email: member.email,
      department: member.department
        ? { id: member.department.id, name: member.department.name, sortOrder: member.department.sortOrder }
        : null,
      pendingProfileChange: pending
    };
  }
}
