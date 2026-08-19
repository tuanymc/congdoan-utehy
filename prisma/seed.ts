/**
 * Seed dữ liệu khởi tạo: 4 vai trò mặc định + quyền cho module post/category + documenttype/document
 * (Phase 3) + 1 tài khoản admin. An toàn chạy lại nhiều lần (toàn bộ dùng upsert).
 * Chạy: pnpm prisma:seed (sau khi đã prisma:migrate/prisma:deploy).
 */
// Chạy trực tiếp bằng tsx (không qua "prisma db seed"), nên KHÔNG tự động nạp .env như các lệnh
// Prisma CLI khác (generate/migrate) — phải nạp tay bằng dotenv trước khi PrismaClient đọc
// process.env.DATABASE_URL. Phải là dòng import đầu tiên, trước khi import PrismaClient.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { SYSTEM_ROLES } from "../packages/types/src/common";

const prisma = new PrismaClient();

const ROLE_SEED = [
  { code: SYSTEM_ROLES.ADMIN, name: "Quản trị hệ thống" },
  { code: SYSTEM_ROLES.UNION_CLERK, name: "Văn thư công đoàn" },
  { code: SYSTEM_ROLES.DEPARTMENT_OFFICER, name: "Cán bộ công đoàn bộ phận" },
  { code: SYSTEM_ROLES.MEMBER, name: "Đoàn viên" }
];

// Danh sách quyền ban đầu cho module Content (post/category) + OfficialDocument (documenttype/
// document, Phase 3) + HomeSlide/UnionDepartment/UnionMember/ContactMessage ("hoàn thiện chức năng
// web mới" — xem prisma/schema.prisma). Các module Phase 2/4 còn lại sẽ bổ sung thêm entry vào đây
// theo đúng khuôn "module:action".
const PERMISSION_SEED = [
  "post",
  "category",
  "documenttype",
  "document",
  "homeslide",
  "uniondepartment",
  "unionmember",
  "contactmessage"
].flatMap((module) =>
  ["view", "create", "update", "delete"].map((action) => ({
    key: `${module}:${action}`,
    module,
    action
  }))
);

// post/category/homeslide/unionmember/uniondepartment đều có route công khai riêng (không qua
// permission này) nên MEMBER không cần "view" ở đây để xem — danh sách này chỉ ảnh hưởng việc MEMBER
// có thấy các module đó trong TRANG QUẢN TRỊ hay không. document/contactmessage là dữ liệu nội bộ,
// module nào được cấp quyền "view" mặc định cho MEMBER (đoàn viên) phải khai rõ ở đây, KHÔNG tự động
// cấp theo action="view" như trước (xem lý do ở đoạn seed quyền MEMBER bên dưới).
const MEMBER_VISIBLE_MODULES = ["post", "category"];

async function main() {
  console.log("Seeding roles...");
  const roles = new Map<string, string>();
  for (const r of ROLE_SEED) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: r
    });
    roles.set(r.code, role.id);
  }

  console.log("Seeding permissions...");
  const permissionIds: string[] = [];
  for (const p of PERMISSION_SEED) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p
    });
    permissionIds.push(perm.id);
  }

  // ADMIN có toàn bộ quyền; MEMBER chỉ có quyền view, và CHỈ với các module công khai
  // (MEMBER_VISIBLE_MODULES) — KHÔNG tự động cấp "document:view"/"documenttype:view" cho MEMBER dù
  // action cũng là "view", vì công văn là dữ liệu nội bộ (xem packages/types/src/official-document.ts).
  const adminRoleId = roles.get(SYSTEM_ROLES.ADMIN)!;
  const memberRoleId = roles.get(SYSTEM_ROLES.MEMBER)!;
  const clerkRoleId = roles.get(SYSTEM_ROLES.UNION_CLERK)!;

  for (const permId of permissionIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRoleId, permissionId: permId } },
      update: {},
      create: { roleId: adminRoleId, permissionId: permId }
    });
  }

  const memberViewPermissions = await prisma.permission.findMany({
    where: { action: "view", module: { in: MEMBER_VISIBLE_MODULES } }
  });
  for (const perm of memberViewPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: memberRoleId, permissionId: perm.id } },
      update: {},
      create: { roleId: memberRoleId, permissionId: perm.id }
    });
  }

  // UNION_CLERK ("Văn thư công đoàn") — người thực tế nhập/tra cứu công văn + quản lý nội dung công
  // khai (banner trang chủ, danh bạ công đoàn viên, hộp thư liên hệ) hàng ngày — được cấp
  // view/create/update, KHÔNG cấp delete (tránh xoá nhầm dữ liệu đã migrate từ web cũ hoặc do người
  // dùng gửi; xoá vẫn làm được qua ADMIN khi thật sự cần).
  console.log("Seeding quyền công văn + nội dung công khai cho UNION_CLERK...");
  const clerkManagedModules = ["documenttype", "document", "homeslide", "uniondepartment", "unionmember", "contactmessage"];
  const clerkDocumentPermissions = await prisma.permission.findMany({
    where: { module: { in: clerkManagedModules }, action: { in: ["view", "create", "update"] } }
  });
  for (const perm of clerkDocumentPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: clerkRoleId, permissionId: perm.id } },
      update: {},
      create: { roleId: clerkRoleId, permissionId: perm.id }
    });
  }

  console.log("Seeding admin user...");
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@congdoan.utehy.edu.vn";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe@123";
  const passwordHash = await hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      fullName: "Quản trị viên hệ thống"
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRoleId } },
    update: {},
    create: { userId: admin.id, roleId: adminRoleId }
  });

  console.log("Seeding sample category...");
  await prisma.category.upsert({
    where: { slug: "tin-chung" },
    update: {},
    create: { slug: "tin-chung", name: "Tin chung", sortOrder: 0 }
  });

  console.log("Done. Tài khoản admin mặc định:", adminEmail, "(đổi mật khẩu ngay sau lần đăng nhập đầu tiên)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
