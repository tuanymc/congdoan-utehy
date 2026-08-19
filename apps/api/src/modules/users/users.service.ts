import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { hash } from "bcryptjs";
import type { PaginatedResult, PaginationQuery, RoleDto, UserDetailDto, UserListItemDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

function toRoleDto(role: { id: string; code: string; name: string; description: string | null }): RoleDto {
  return { id: role.id, code: role.code as RoleDto["code"], name: role.name, description: role.description };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async list(query: PaginationQuery): Promise<PaginatedResult<UserListItemDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = query.search
      ? {
          OR: [
            { email: { contains: query.search } },
            { fullName: { contains: query.search } }
          ]
        }
      : {};

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: { roles: { include: { role: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        isActive: u.isActive,
        roles: u.roles.map((ur) => toRoleDto(ur.role)),
        createdAt: u.createdAt.toISOString()
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async findOne(id: string): Promise<UserDetailDto> {
    const u = await this.prisma.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
    if (!u) throw new NotFoundException("Không tìm thấy người dùng.");
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      isActive: u.isActive,
      roles: u.roles.map((ur) => toRoleDto(ur.role)),
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null
    };
  }

  async create(dto: CreateUserDto, actorUserId: string): Promise<UserDetailDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email đã được sử dụng.");

    const passwordHash = await hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        roles: { create: dto.roleIds.map((roleId) => ({ roleId })) }
      }
    });

    await this.auditLog.record({ actorUserId, action: "create", entityType: "User", entityId: user.id });
    return this.findOne(user.id);
  }

  async update(id: string, dto: UpdateUserDto, actorUserId: string): Promise<UserDetailDto> {
    const before = await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        isActive: dto.isActive
      }
    });

    if (dto.roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      await this.prisma.userRole.createMany({ data: dto.roleIds.map((roleId) => ({ userId: id, roleId })) });
    }

    const after = await this.findOne(id);
    await this.auditLog.record({
      actorUserId,
      action: "update",
      entityType: "User",
      entityId: id,
      changes: { fullName: { before: before.fullName, after: after.fullName }, isActive: { before: before.isActive, after: after.isActive } }
    });
    return after;
  }

  async listRoles(): Promise<RoleDto[]> {
    const roles = await this.prisma.role.findMany({ orderBy: { name: "asc" } });
    return roles.map(toRoleDto);
  }
}
