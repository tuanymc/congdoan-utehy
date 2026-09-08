/**
 * Tạo tài khoản đăng nhập (vai trò MEMBER) cho công đoàn viên chưa có userId.
 * Mật khẩu mặc định: DEFAULT_UNION_MEMBER_PASSWORD (hyute123).
 * Không gửi email. An toàn chạy lại: bỏ qua hồ sơ đã có tài khoản / thiếu email / email trùng quản trị.
 *
 * Trên VPS (PowerShell, thư mục gốc repo, ví dụ C:\inetpub\congdoan-src):
 *   Copy-Item C:\inetpub\congdoan2026\shared\.env .env -Force
 *   pnpm create:member-logins
 */
import { existsSync } from "fs";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { SYSTEM_ROLES } from "../packages/types/src/common";
import { DEFAULT_UNION_MEMBER_PASSWORD } from "../packages/types/src/union-directory";

loadEnv();
const sharedEnvCandidates = [
  "C:\\inetpub\\congdoan2026\\shared\\.env",
  "C:\\inetpub\\congdoan\\shared\\.env"
];
if (!process.env.DATABASE_URL) {
  const sharedEnv = sharedEnvCandidates.find((p) => existsSync(p));
  if (sharedEnv) loadEnv({ path: sharedEnv });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const prisma = new PrismaClient();

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Thiếu DATABASE_URL. Đặt trong .env ở thư mục gốc repo rồi chạy lại.");
  }

  const memberRole = await prisma.role.findUnique({ where: { code: SYSTEM_ROLES.MEMBER } });
  if (!memberRole) {
    throw new Error("Chưa có vai trò MEMBER. Chạy pnpm prisma:seed rồi thử lại.");
  }

  const admin = await prisma.user.findFirst({
    where: { roles: { some: { role: { code: SYSTEM_ROLES.ADMIN } } } },
    select: { id: true, email: true }
  });
  if (!admin) {
    throw new Error("Không tìm thấy tài khoản ADMIN để ghi nhật ký.");
  }

  const members = await prisma.unionMember.findMany({
    where: { userId: null },
    select: { id: true, fullName: true, email: true, legacyCode: true, userId: true },
    orderBy: [{ sortOrder: "asc" }, { fullName: "asc" }]
  });

  const passwordHash = await hash(DEFAULT_UNION_MEMBER_PASSWORD, 12);
  let created = 0;
  let linkedExisting = 0;
  let skipped = 0;
  const skipReasons: string[] = [];

  console.log(
    `Tìm thấy ${members.length} công đoàn viên chưa có tài khoản. Mật khẩu mặc định: ${DEFAULT_UNION_MEMBER_PASSWORD}`
  );
  console.log("Không gửi email — chỉ tạo / gắn tài khoản.");

  for (const member of members) {
    const email = member.email?.trim() ?? "";
    const label = `${member.legacyCode ?? "—"} · ${member.fullName}`;

    if (!email || !isValidEmail(email)) {
      skipped += 1;
      skipReasons.push(`${label}: thiếu email hợp lệ`);
      continue;
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } }
    });

    if (existing) {
      const isStaffAccount = existing.roles.some((ur) => ur.role.code !== SYSTEM_ROLES.MEMBER);
      if (isStaffAccount) {
        skipped += 1;
        skipReasons.push(`${label}: email "${email}" đang là tài khoản quản trị`);
        continue;
      }
      const otherLink = await prisma.unionMember.findFirst({
        where: { userId: existing.id, NOT: { id: member.id } },
        select: { fullName: true }
      });
      if (otherLink) {
        skipped += 1;
        skipReasons.push(`${label}: email "${email}" đã liên kết với "${otherLink.fullName}"`);
        continue;
      }
      await prisma.unionMember.update({ where: { id: member.id }, data: { userId: existing.id } });
      await prisma.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "update",
          entityType: "UnionMember",
          entityId: member.id,
          changesJson: JSON.stringify({ userId: { before: null, after: existing.id } })
        }
      });
      linkedExisting += 1;
      console.log(`Gắn tài khoản sẵn có: ${label} <${email}>`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email,
        fullName: member.fullName,
        passwordHash,
        roles: { create: [{ roleId: memberRole.id }] }
      }
    });
    await prisma.unionMember.update({ where: { id: member.id }, data: { userId: user.id } });
    await prisma.auditLog.create({
      data: { actorUserId: admin.id, action: "create", entityType: "User", entityId: user.id }
    });
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "update",
        entityType: "UnionMember",
        entityId: member.id,
        changesJson: JSON.stringify({ userId: { before: null, after: user.id } })
      }
    });

    created += 1;
    console.log(`Tạo mới: ${label} <${email}>`);
  }

  console.log("\nKết quả:");
  console.log(`  Tạo mới: ${created}`);
  console.log(`  Gắn tài khoản sẵn có: ${linkedExisting}`);
  console.log(`  Bỏ qua: ${skipped}`);
  if (skipReasons.length > 0) {
    console.log("\nHồ sơ bỏ qua:");
    for (const reason of skipReasons) console.log(`  - ${reason}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
