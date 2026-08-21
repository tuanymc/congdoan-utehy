import { randomBytes } from "crypto";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { hash } from "bcryptjs";
import {
  DEFAULT_UNION_MEMBER_PASSWORD,
  SYSTEM_ROLES,
  type CreateUnionMemberLoginItemResult,
  type CreateUnionMemberLoginsRequest,
  type CreateUnionMemberLoginsResultDto
} from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { MailService } from "../../common/mail.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

function randomPassword(length = 10): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => PASSWORD_ALPHABET[b % PASSWORD_ALPHABET.length]).join("");
}

function uniqueTrimmed(values: string[] | undefined): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values ?? []) {
    const value = raw.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function skipItem(
  partial: Partial<CreateUnionMemberLoginItemResult> & { reason: string }
): CreateUnionMemberLoginItemResult {
  return {
    memberId: partial.memberId ?? null,
    fullName: partial.fullName ?? null,
    legacyCode: partial.legacyCode ?? null,
    email: partial.email ?? null,
    status: "skipped",
    reason: partial.reason
  };
}

type MemberRow = {
  id: string;
  fullName: string;
  email: string | null;
  legacyCode: string | null;
  userId: string | null;
};

/**
 * Tạo tài khoản đăng nhập (User vai trò MEMBER) từ hồ sơ công đoàn viên — theo mã cán bộ hoặc id
 * hồ sơ. UNION_CLERK được phép gọi (unionmember:update), không đi qua UsersController (ADMIN-only).
 */
@Injectable()
export class UnionMembersLoginService {
  private readonly logger = new Logger(UnionMembersLoginService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly mail: MailService
  ) {}

  async createLogins(dto: CreateUnionMemberLoginsRequest, actorUserId: string): Promise<CreateUnionMemberLoginsResultDto> {
    const memberIds = uniqueTrimmed(dto.memberIds);
    const staffCodes = uniqueTrimmed(dto.staffCodes);
    if (!dto.allEligible && memberIds.length === 0 && staffCodes.length === 0) {
      throw new BadRequestException("Chọn công đoàn viên, nhập mã cán bộ, hoặc tạo cho toàn bộ hồ sơ đủ điều kiện.");
    }

    const { members, skips } = await this.resolveMembers({
      memberIds,
      staffCodes,
      allEligible: Boolean(dto.allEligible)
    });
    const memberRole = await this.prisma.role.findUnique({ where: { code: SYSTEM_ROLES.MEMBER } });
    if (!memberRole) {
      throw new BadRequestException("Chưa có vai trò Đoàn viên (MEMBER). Chạy seed rồi thử lại.");
    }

    const defaultHash = dto.passwordMode === "default" ? await hash(DEFAULT_UNION_MEMBER_PASSWORD, 12) : null;
    const loginUrl = `${(process.env.PUBLIC_WEB_URL ?? "https://tdg3.utehy.edu.vn").replace(/\/$/, "")}/dang-nhap`;
    const items: CreateUnionMemberLoginItemResult[] = [...skips];

    for (const member of members) {
      items.push(await this.createOrLinkOne(member, dto.passwordMode, memberRole.id, defaultHash, loginUrl, actorUserId));
    }

    return {
      created: items.filter((i) => i.status === "created").length,
      linkedExisting: items.filter((i) => i.status === "linked_existing").length,
      skipped: items.filter((i) => i.status === "skipped").length,
      emailed: items.filter((i) => i.emailSent).length,
      mailConfigured: this.mail.isConfigured(),
      items
    };
  }

  private async resolveMembers(params: {
    memberIds: string[];
    staffCodes: string[];
    allEligible: boolean;
  }): Promise<{ members: MemberRow[]; skips: CreateUnionMemberLoginItemResult[] }> {
    const select = { id: true, fullName: true, email: true, legacyCode: true, userId: true } as const;
    const seen = new Set<string>();
    const members: MemberRow[] = [];
    const skips: CreateUnionMemberLoginItemResult[] = [];

    const pushMember = (row: MemberRow) => {
      if (seen.has(row.id)) return;
      seen.add(row.id);
      members.push(row);
    };

    if (params.memberIds.length > 0) {
      const rows: MemberRow[] = await this.prisma.unionMember.findMany({
        where: { id: { in: params.memberIds } },
        select
      });
      const found = new Set(rows.map((row) => row.id));
      rows.forEach(pushMember);
      for (const id of params.memberIds) {
        if (!found.has(id)) {
          skips.push(skipItem({ memberId: id, reason: "Không tìm thấy hồ sơ công đoàn viên." }));
        }
      }
    }

    if (params.staffCodes.length > 0) {
      for (const code of params.staffCodes) {
        const matches = await this.prisma.unionMember.findMany({ where: { legacyCode: code }, select, take: 3 });
        if (matches.length === 0) {
          skips.push(skipItem({ legacyCode: code, reason: `Không tìm thấy công đoàn viên với mã cán bộ "${code}".` }));
          continue;
        }
        if (matches.length > 1) {
          skips.push(skipItem({ legacyCode: code, reason: `Mã cán bộ "${code}" trùng nhiều hồ sơ.` }));
          continue;
        }
        pushMember(matches[0]);
      }
    }

    if (params.allEligible) {
      const rows = await this.prisma.unionMember.findMany({
        where: {
          userId: null,
          AND: [{ email: { not: null } }, { legacyCode: { not: null } }]
        },
        select
      });
      rows.forEach(pushMember);
    }

    return { members, skips };
  }

  private async createOrLinkOne(
    member: MemberRow,
    passwordMode: CreateUnionMemberLoginsRequest["passwordMode"],
    memberRoleId: string,
    defaultHash: string | null,
    loginUrl: string,
    actorUserId: string
  ): Promise<CreateUnionMemberLoginItemResult> {
    const base = {
      memberId: member.id,
      fullName: member.fullName,
      legacyCode: member.legacyCode,
      email: member.email
    };

    if (member.userId) {
      return skipItem({ ...base, reason: "Hồ sơ này đã có tài khoản đăng nhập." });
    }

    const email = member.email?.trim() ?? "";
    if (!email || !isValidEmail(email)) {
      return skipItem({
        ...base,
        reason: "Thiếu email hợp lệ — không tạo được tài khoản / không gửi được mật khẩu."
      });
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } }
    });

    if (existing) {
      const isStaffAccount = existing.roles.some(
        (ur: { role: { code: string } }) => ur.role.code !== SYSTEM_ROLES.MEMBER
      );
      if (isStaffAccount) {
        return skipItem({
          ...base,
          reason: `Email "${email}" đang là tài khoản quản trị, không tự gắn với công đoàn viên.`
        });
      }
      const otherLink = await this.prisma.unionMember.findFirst({
        where: { userId: existing.id, NOT: { id: member.id } },
        select: { id: true, fullName: true }
      });
      if (otherLink) {
        return skipItem({
          ...base,
          reason: `Email "${email}" đã liên kết với "${otherLink.fullName}".`
        });
      }
      await this.prisma.unionMember.update({ where: { id: member.id }, data: { userId: existing.id } });
      await this.auditLog.record({
        actorUserId,
        action: "update",
        entityType: "UnionMember",
        entityId: member.id,
        changes: { userId: { before: null, after: existing.id } }
      });
      return { ...base, status: "linked_existing", reason: "Đã gắn với tài khoản sẵn có (không đổi mật khẩu)." };
    }

    const plainPassword = passwordMode === "random" ? randomPassword() : DEFAULT_UNION_MEMBER_PASSWORD;
    const passwordHash = defaultHash ?? (await hash(plainPassword, 12));

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: member.fullName,
        passwordHash,
        roles: { create: [{ roleId: memberRoleId }] }
      }
    });

    await this.prisma.unionMember.update({ where: { id: member.id }, data: { userId: user.id } });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "User", entityId: user.id });
    await this.auditLog.record({
      actorUserId,
      action: "update",
      entityType: "UnionMember",
      entityId: member.id,
      changes: { userId: { before: null, after: user.id } }
    });

    const emailBody = [
      `Kính gửi ${member.fullName},`,
      "",
      "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên đã tạo tài khoản để bạn đăng nhập cổng thông tin công đoàn viên.",
      "",
      `Mã cán bộ: ${member.legacyCode ?? "—"}`,
      `Email đăng nhập: ${email}`,
      `Mật khẩu: ${plainPassword}`,
      "",
      `Đăng nhập tại: ${loginUrl}`,
      "Bạn cũng có thể đăng nhập bằng mã cán bộ. Sau khi đăng nhập, vui lòng đổi mật khẩu tại mục Bảo mật.",
      "",
      "Trân trọng,",
      "Công đoàn UTEHY"
    ].join("\n");

    const emailSent = await this.mail.sendMail(email, "Tài khoản cổng công đoàn viên UTEHY", emailBody);
    if (!emailSent) {
      this.logger.warn(`Đã tạo tài khoản ${email} nhưng chưa gửi được email.`);
    }

    return {
      ...base,
      status: "created",
      emailSent,
      ...(passwordMode === "random" && !emailSent ? { temporaryPassword: plainPassword } : {})
    };
  }
}
