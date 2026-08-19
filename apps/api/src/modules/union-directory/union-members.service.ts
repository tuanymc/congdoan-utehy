import { Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationQuery, UnionMemberListItemDto } from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateUnionMemberDto } from "./dto/create-union-member.dto";
import { UpdateUnionMemberDto } from "./dto/update-union-member.dto";

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
    isPublic: m.isPublic,
    sortOrder: m.sortOrder,
    department: m.department ? { id: m.department.id, name: m.department.name, sortOrder: m.department.sortOrder } : null
  };
}

/**
 * Danh bạ công đoàn viên — nguồn NHANVIEN (xem chú thích domain block UNIONDIRECTORY trong
 * prisma/schema.prisma). Thứ tự sắp xếp mặc định khớp web cũ (PHONGBAN, CHUCVU rồi tới NGAYSINH —
 * đơn giản hoá thành department rồi sortOrder ở bản mới vì không giữ lại field NGAYSINH/PHONGBAN).
 */
@Injectable()
export class UnionMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  /** Công khai — CHỈ trả công đoàn viên isPublic=true (khớp NHANVIEN.STATUS=1 ở web cũ). */
  async listPublic(query: PaginationQuery & { departmentId?: string }): Promise<PaginatedResult<UnionMemberListItemDto>> {
    return this.queryList({ ...query, isPublic: true });
  }

  /** Quản trị — trả toàn bộ, không lọc isPublic, để admin có thể bật lại người đang bị ẩn. */
  async listForAdmin(query: PaginationQuery & { departmentId?: string }): Promise<PaginatedResult<UnionMemberListItemDto>> {
    return this.queryList(query);
  }

  private async queryList(
    query: PaginationQuery & { departmentId?: string; isPublic?: boolean }
  ): Promise<PaginatedResult<UnionMemberListItemDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;
    const where: Prisma.UnionMemberWhereInput = {
      ...(query.isPublic !== undefined ? { isPublic: query.isPublic } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.search ? { fullName: { contains: query.search } } : {})
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

    return { items: members.map(toDto), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string): Promise<UnionMemberListItemDto> {
    const member = await this.prisma.unionMember.findUnique({ where: { id }, ...memberWithRelations });
    if (!member) throw new NotFoundException("Không tìm thấy công đoàn viên.");
    return toDto(member);
  }

  async create(dto: CreateUnionMemberDto, actorUserId: string): Promise<UnionMemberListItemDto> {
    const member = await this.prisma.unionMember.create({
      data: {
        fullName: dto.fullName,
        photoUrl: dto.photoUrl,
        degreeLabel: dto.degreeLabel,
        positionTitle: dto.positionTitle,
        phone: dto.phone,
        email: dto.email,
        isPublic: dto.isPublic ?? true,
        sortOrder: dto.sortOrder ?? 0,
        departmentId: dto.departmentId
      },
      ...memberWithRelations
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "UnionMember", entityId: member.id });
    return toDto(member);
  }

  async update(id: string, dto: UpdateUnionMemberDto, actorUserId: string): Promise<UnionMemberListItemDto> {
    await this.findOne(id);
    const member = await this.prisma.unionMember.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        photoUrl: dto.photoUrl,
        degreeLabel: dto.degreeLabel,
        positionTitle: dto.positionTitle,
        phone: dto.phone,
        email: dto.email,
        isPublic: dto.isPublic,
        sortOrder: dto.sortOrder,
        departmentId: dto.departmentId
      },
      ...memberWithRelations
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "UnionMember", entityId: id });
    return toDto(member);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.unionMember.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "UnionMember", entityId: id });
  }
}
