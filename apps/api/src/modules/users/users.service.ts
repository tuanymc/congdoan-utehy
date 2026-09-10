import { randomBytes } from "crypto";
import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { hash } from "bcryptjs";
import type {
  PaginatedResult,
  PaginationQuery,
  ResetUserPasswordResponse,
  RoleDto,
  UserDetailDto,
  UserListItemDto
} from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { MailService } from "../../common/mail.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function randomPassword(length = 10): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => PASSWORD_ALPHABET[b % PASSWORD_ALPHABET.length]).join("");
}

function toRoleDto(role: { id: string; code: string; name: string; description: string | null }): RoleDto {
  return { id: role.id, code: role.code as RoleDto["code"], name: role.name, description: role.description };
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly mail: MailService
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

  async resetPassword(id: string, actorUserId: string): Promise<ResetUserPasswordResponse> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Không tìm thấy người dùng.");

    const plainPassword = randomPassword();
    const passwordHash = await hash(plainPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    await this.prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    await this.auditLog.record({
      actorUserId,
      action: "update",
      entityType: "User",
      entityId: id,
      changes: { passwordReset: { before: false, after: true } }
    });

    const publicBase = (process.env.PUBLIC_WEB_URL ?? "https://congdoan.utehy.edu.vn").replace(/\/$/, "");
    const loginUrl = `${publicBase}/dang-nhap`;
    const adminUrl = `${publicBase}/admin/login`;
    const emailBody = [
      `Kính gửi ${user.fullName},`,
      "",
      "Công đoàn Trường Đại học Công nghệ Kỹ thuật Hưng Yên đã cấp lại mật khẩu đăng nhập cho tài khoản của bạn.",
      "",
      `Email đăng nhập: ${user.email}`,
      `Mật khẩu mới: ${plainPassword}`,
      "",
      `Cổng công đoàn viên: ${loginUrl}`,
      `Trang quản trị: ${adminUrl}`,
      "Sau khi đăng nhập, vui lòng đổi mật khẩu tại mục Bảo mật.",
      "",
      "Trân trọng,",
      "Công đoàn HYUTE"
    ].join("\n");

    const emailSent = await this.mail.sendMail(user.email, "Cấp lại mật khẩu cổng Công đoàn HYUTE", emailBody);
    if (!emailSent) {
      this.logger.warn(`Đã reset mật khẩu ${user.email} nhưng chưa gửi được email.`);
    }

    return {
      emailSent,
      mailConfigured: this.mail.isConfigured(),
      ...(emailSent ? {} : { temporaryPassword: plainPassword })
    };
  }
}
