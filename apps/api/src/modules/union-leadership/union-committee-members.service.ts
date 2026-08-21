import { Injectable, NotFoundException } from "@nestjs/common";
import type { UnionCommitteeMemberDto } from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateUnionCommitteeMemberDto } from "./dto/create-union-committee-member.dto";
import { UpdateUnionCommitteeMemberDto } from "./dto/update-union-committee-member.dto";
import { QueryUnionCommitteeMembersDto } from "./dto/query-union-committee-members.dto";

/** Sentinel departmentId FE gửi lên để lọc/set rõ ràng "cấp trường" (không thuộc bộ phận nào) — phân
 * biệt với KHÔNG gửi departmentId (nghĩa là lấy/không đổi tất cả các cấp). Dùng "" thay vì null vì
 * query string HTTP không truyền được null, và DTO field vẫn giữ kiểu string thuần (xem
 * QueryUnionCommitteeMembersDto/CreateUnionCommitteeMemberRequest). */
const SCHOOL_LEVEL_SENTINEL = "__school__";

const committeeMemberWithRelations = Prisma.validator<Prisma.UnionCommitteeMemberDefaultArgs>()({
  include: {
    member: { select: { id: true, fullName: true, photoUrl: true, degreeLabel: true } },
    department: true
  }
});
type CommitteeMemberWithRelations = Prisma.UnionCommitteeMemberGetPayload<typeof committeeMemberWithRelations>;

function toDto(c: CommitteeMemberWithRelations): UnionCommitteeMemberDto {
  return {
    id: c.id,
    termId: c.termId,
    memberId: c.memberId,
    member: {
      id: c.member.id,
      fullName: c.member.fullName,
      photoUrl: c.member.photoUrl,
      degreeLabel: c.member.degreeLabel
    },
    departmentId: c.departmentId,
    department: c.department ? { id: c.department.id, name: c.department.name, sortOrder: c.department.sortOrder } : null,
    positionTitle: c.positionTitle,
    sortOrder: c.sortOrder,
    note: c.note
  };
}

/** Ban chấp hành công đoàn theo nhiệm kỳ — nguồn NHANVIEN_NHIEMKY + tblPhongBan_NV_NK (xem chú thích
 * domain block UnionCommitteeMember trong prisma/schema.prisma). Dùng chung cho endpoint công khai
 * (chỉ đọc) VÀ trang quản trị (đầy đủ CRUD) — không có field nội bộ nào cần tách riêng ở đây (khác
 * UnionMember/UnionMemberProfile), nên KHÔNG cần 2 hàm findOne/findOneForAdmin riêng. */
@Injectable()
export class UnionCommitteeMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async list(query: QueryUnionCommitteeMembersDto): Promise<UnionCommitteeMemberDto[]> {
    const where: Prisma.UnionCommitteeMemberWhereInput = {
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.departmentId === SCHOOL_LEVEL_SENTINEL
        ? { departmentId: null }
        : query.departmentId
          ? { departmentId: query.departmentId }
          : {})
    };
    const members = await this.prisma.unionCommitteeMember.findMany({
      where,
      ...committeeMemberWithRelations,
      orderBy: [{ sortOrder: "asc" }]
    });
    return members.map(toDto);
  }

  async findOne(id: string): Promise<UnionCommitteeMemberDto> {
    const member = await this.prisma.unionCommitteeMember.findUnique({ where: { id }, ...committeeMemberWithRelations });
    if (!member) throw new NotFoundException("Không tìm thấy thành viên Ban chấp hành.");
    return toDto(member);
  }

  /** undefined = không đổi departmentId (chỉ dùng ở update), "" hoặc SCHOOL_LEVEL_SENTINEL = cấp
   * trường (null), giá trị khác = departmentId cụ thể. */
  private resolveDepartmentId(departmentId: string | undefined): string | null | undefined {
    if (departmentId === undefined) return undefined;
    if (departmentId.trim() === "" || departmentId === SCHOOL_LEVEL_SENTINEL) return null;
    return departmentId;
  }

  async create(dto: CreateUnionCommitteeMemberDto, actorUserId: string): Promise<UnionCommitteeMemberDto> {
    const member = await this.prisma.unionCommitteeMember.create({
      data: {
        termId: dto.termId,
        memberId: dto.memberId,
        departmentId: this.resolveDepartmentId(dto.departmentId) ?? null,
        positionTitle: dto.positionTitle,
        sortOrder: dto.sortOrder ?? 0,
        note: dto.note
      },
      ...committeeMemberWithRelations
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "UnionCommitteeMember", entityId: member.id });
    return toDto(member);
  }

  async update(id: string, dto: UpdateUnionCommitteeMemberDto, actorUserId: string): Promise<UnionCommitteeMemberDto> {
    await this.findOne(id);
    const resolvedDepartmentId = this.resolveDepartmentId(dto.departmentId);
    const member = await this.prisma.unionCommitteeMember.update({
      where: { id },
      data: {
        termId: dto.termId,
        memberId: dto.memberId,
        ...(resolvedDepartmentId !== undefined ? { departmentId: resolvedDepartmentId } : {}),
        positionTitle: dto.positionTitle,
        sortOrder: dto.sortOrder,
        note: dto.note
      },
      ...committeeMemberWithRelations
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "UnionCommitteeMember", entityId: id });
    return toDto(member);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.unionCommitteeMember.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "UnionCommitteeMember", entityId: id });
  }
}
