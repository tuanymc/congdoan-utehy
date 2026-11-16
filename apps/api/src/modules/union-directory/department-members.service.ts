import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  DepartmentMemberScopeDto,
  JwtAccessPayload,
  PaginatedResult,
  PaginationQuery,
  UnionDepartmentDto,
  UnionMemberListItemDto
} from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { isDepartmentChairTitle } from "./department-chair";
import { UpdateDepartmentMemberDto } from "./dto/update-department-member.dto";

const memberWithRelations = Prisma.validator<Prisma.UnionMemberDefaultArgs>()({
  include: { department: true }
});
type MemberWithRelations = Prisma.UnionMemberGetPayload<typeof memberWithRelations>;

function toDto(m: MemberWithRelations): UnionMemberListItemDto {
  return {
    id: m.id,
    fullName: m.fullName,
    photoUrl: m.photoUrl,
    degreeLabel: m.degreeLabel,
    positionTitle: m.positionTitle,
    phone: m.phone,
    email: m.email,
    contactVisible: true,
    isPublic: m.isPublic,
    sortOrder: m.sortOrder,
    department: m.department
      ? { id: m.department.id, name: m.department.name, sortOrder: m.department.sortOrder }
      : null
  };
}

function emptyToNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * Chủ tịch / cán bộ công đoàn bộ phận xem-sửa đoàn viên thuộc bộ phận mình trên cổng /cong-doan-vien.
 * Không thêm, không xoá, không đổi bộ phận. Không dùng permission unionmember:* (tránh seed production).
 */
@Injectable()
export class DepartmentMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async getScope(user: JwtAccessPayload): Promise<DepartmentMemberScopeDto> {
    const departments = await this.resolveManagedDepartments(user);
    return { canManage: departments.length > 0, departments };
  }

  async list(
    user: JwtAccessPayload,
    query: PaginationQuery & { departmentId?: string }
  ): Promise<PaginatedResult<UnionMemberListItemDto>> {
    const managed = await this.requireManagedDepartmentIds(user);
    const departmentId = query.departmentId?.trim();
    if (departmentId && !managed.includes(departmentId)) {
      throw new ForbiddenException("Bạn không quản lý công đoàn bộ phận này.");
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const search = query.search?.trim();
    const where: Prisma.UnionMemberWhereInput = {
      departmentId: departmentId ? departmentId : { in: managed },
      ...(search ? { fullName: { contains: search } } : {})
    };

    const [total, members] = await this.prisma.$transaction([
      this.prisma.unionMember.count({ where }),
      this.prisma.unionMember.findMany({
        where,
        ...memberWithRelations,
        orderBy: [{ sortOrder: "asc" }, { fullName: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return {
      items: members.map(toDto),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async findOne(user: JwtAccessPayload, id: string): Promise<UnionMemberListItemDto> {
    const member = await this.findManagedOrThrow(user, id);
    return toDto(member);
  }

  async update(
    user: JwtAccessPayload,
    id: string,
    dto: UpdateDepartmentMemberDto
  ): Promise<UnionMemberListItemDto> {
    await this.findManagedOrThrow(user, id);
    const fullName = dto.fullName === undefined ? undefined : dto.fullName.trim();
    if (fullName === "") {
      throw new BadRequestException("Họ và tên không được để trống.");
    }

    const updated = await this.prisma.unionMember.update({
      where: { id },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(dto.photoUrl !== undefined ? { photoUrl: emptyToNull(dto.photoUrl) } : {}),
        ...(dto.degreeLabel !== undefined ? { degreeLabel: emptyToNull(dto.degreeLabel) } : {}),
        ...(dto.positionTitle !== undefined ? { positionTitle: emptyToNull(dto.positionTitle) } : {}),
        ...(dto.phone !== undefined ? { phone: emptyToNull(dto.phone) } : {}),
        ...(dto.email !== undefined ? { email: emptyToNull(dto.email) } : {})
      },
      ...memberWithRelations
    });
    await this.auditLog.record({
      actorUserId: user.sub,
      action: "update",
      entityType: "UnionMember",
      entityId: id
    });
    return toDto(updated);
  }

  private async findManagedOrThrow(user: JwtAccessPayload, id: string): Promise<MemberWithRelations> {
    const managed = await this.requireManagedDepartmentIds(user);
    const member = await this.prisma.unionMember.findUnique({ where: { id }, ...memberWithRelations });
    if (!member || !member.departmentId || !managed.includes(member.departmentId)) {
      throw new NotFoundException("Không tìm thấy công đoàn viên trong bộ phận bạn quản lý.");
    }
    return member;
  }

  private async requireManagedDepartmentIds(user: JwtAccessPayload): Promise<string[]> {
    const departments = await this.resolveManagedDepartments(user);
    if (departments.length === 0) {
      throw new ForbiddenException(
        "Tài khoản không phải chủ tịch công đoàn bộ phận hoặc chưa được gắn bộ phận."
      );
    }
    return departments.map((d) => d.id);
  }

  private addDepartment(
    byId: Map<string, UnionDepartmentDto>,
    department: { id: string; name: string; sortOrder: number } | null | undefined
  ) {
    if (!department) return;
    byId.set(department.id, { id: department.id, name: department.name, sortOrder: department.sortOrder });
  }

  private async resolveManagedDepartments(user: JwtAccessPayload): Promise<UnionDepartmentDto[]> {
    const byId = new Map<string, UnionDepartmentDto>();

    const seats = await this.prisma.unionCommitteeMember.findMany({
      where: {
        departmentId: { not: null },
        member: { userId: user.sub }
      },
      include: { department: true }
    });
    const chairSeats = seats.filter((seat) => seat.department && isDepartmentChairTitle(seat.positionTitle));
    const currentTermId = (await this.prisma.unionTerm.findFirst({ where: { isCurrent: true }, select: { id: true } }))
      ?.id;
    const preferredSeats =
      currentTermId && chairSeats.some((seat) => seat.termId === currentTermId)
        ? chairSeats.filter((seat) => seat.termId === currentTermId)
        : chairSeats;
    for (const seat of preferredSeats) {
      this.addDepartment(byId, seat.department);
    }

    const mine = await this.prisma.unionMember.findFirst({
      where: { userId: user.sub },
      include: { department: true, profile: true }
    });
    if (mine?.department && isDepartmentChairTitle(mine.profile?.unionPosition)) {
      this.addDepartment(byId, mine.department);
    }
    if (user.roles.includes("DEPARTMENT_OFFICER")) {
      this.addDepartment(byId, mine?.department);
    }

    return [...byId.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "vi"));
  }
}
