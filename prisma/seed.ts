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
  "contactmessage",
  "menuitem",
  "sitesetting"
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
  const clerkManagedModules = [
    "documenttype",
    "document",
    "homeslide",
    "uniondepartment",
    "unionmember",
    "contactmessage",
    "menuitem"
  ];
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

  // Menu điều hướng mặc định — khớp y hệt cấu trúc từng hard-code ở apps/web Header.tsx trước khi có
  // trang quản lý menu trong admin. Chỉ "create" (update: {}) — sau lần seed đầu tiên, admin có thể tự
  // sửa/xoá/thêm mục qua trang quản trị mà không lo lần "pnpm prisma:seed" sau ghi đè mất tuỳ chỉnh.
  console.log("Seeding menu điều hướng mặc định...");
  const TOP_MENU_SEED = [
    { code: "top-home", label: "Trang chủ", url: "/", sortOrder: 0 },
    { code: "top-about", label: "Giới thiệu", url: "/gioi-thieu", sortOrder: 10 },
    { code: "top-activity", label: "Tin hoạt động", url: "/tin-tuc", sortOrder: 20, autoCategoryChildren: true },
    { code: "top-document", label: "Văn bản", url: "/van-ban", sortOrder: 30 },
    { code: "top-members", label: "Công đoàn viên", url: "/danh-ba-cong-doan-vien", sortOrder: 40 },
    { code: "top-feedback", label: "Ý kiến Công đoàn viên", url: "/tin-tuc?category=tin-tuc-khac", sortOrder: 50 },
    { code: "top-reading", label: "Văn hóa đọc", url: "/tin-tuc?category=van-hoa-doc", sortOrder: 60 }
  ];
  const topMenuIds = new Map<string, string>();
  for (const m of TOP_MENU_SEED) {
    const item = await prisma.menuItem.upsert({
      where: { code: m.code },
      update: {},
      create: {
        code: m.code,
        label: m.label,
        url: m.url,
        sortOrder: m.sortOrder,
        autoCategoryChildren: m.autoCategoryChildren ?? false
      }
    });
    topMenuIds.set(m.code, item.id);
  }

  /* Đối chiếu trực tiếp với menu web cũ (khối "menu-tuan" ở trang chủ) — dropdown "Giới thiệu" web cũ
   * có 14 mục (Giới thiệu chung, Chức năng nhiệm vụ, Ban chấp hành, Cơ cấu tổ chức, BCH qua các thời
   * kỳ, Ủy ban kiểm tra, Ban Tuyên giáo nữ công, Ban Văn thể, Ban Tài chính, Ban Thanh tra nhân dân, Ban
   * Chính sách pháp luật, Văn phòng, Ban chuyên môn, Liên hệ) nhưng ở web mới TOÀN BỘ nội dung đó chỉ
   * là các bài viết (Post) trong 1 category "gioi-thieu" duy nhất, được AboutPage.tsx tự gom lại thành
   * đúng 3 nhóm cố định (id neo "gioi-thieu-chung"/"ban-chap-hanh-cong-doan"/"cac-ban-chuyen-mon" — xem
   * GROUPS trong AboutPage.tsx) — 9/13 mục con của web cũ KHÔNG phải trang/neo riêng biệt nên KHÔNG
   * thêm thành 14 mục trùng lặp trỏ về cùng 3 neo (rối menu, sai khác biệt thật). 4 mục dưới đây đã là
   * đầy đủ những gì trang Giới thiệu web mới thực sự hỗ trợ.
   * Dropdown "Tin hoạt động" web cũ (14 mục) KHÔNG cần seed tay — top-activity đã bật
   * autoCategoryChildren=true, tự động liệt kê MỌI category thật (Công tác tổ chức, Tuyên truyền giáo
   * dục, Chính sách pháp luật, Công tác Nữ công giới, Câu lạc bộ, Hoạt động chuyên môn, ủng hộ hỗ trợ,
   * UBKT, giao lưu, công đoàn bộ phận, Tin tức khác, Gương nhà giáo, Đồng hành cùng con, Khoẻ cùng
   * chuyên gia...) đã ETL từ web cũ — xem MenuItemsService.buildAutoCategoryEntries().
   * Dropdown "Văn bản" web cũ có 6 mục: 3 mục dưới đây (Tất cả/Công văn đi/Công văn đến + Thông báo nếu
   * tìm thấy loại công văn cùng tên, xem đoạn seed riêng bên dưới) có trang thật tương ứng. 3 mục còn
   * lại CHỦ ĐỘNG bỏ qua vì không có tính năng tương ứng ở web mới: "Quy trình, Biểu mẫu" (web cũ trỏ
   * thẳng /van-ban — trang tải biểu mẫu tĩnh, chưa ETL nội dung này), "Văn bản nội bộ" (trỏ
   * /cv2/Login.aspx — hệ quản lý công văn nội bộ có luồng duyệt riêng, đã chủ động không xây lại, xem
   * ghi chú domain OFFICIALDOCUMENT trong schema.prisma), "Báo Cáo" (trỏ /so-lieu-thong-ke — trang số
   * liệu thống kê, chưa có trang tương đương ở web mới). */
  const CHILD_MENU_SEED = [
    {
      code: "about-child-chung",
      parentCode: "top-about",
      label: "Giới thiệu chung",
      url: "/gioi-thieu#gioi-thieu-chung",
      sortOrder: 0
    },
    {
      code: "about-child-bch",
      parentCode: "top-about",
      label: "Ban Chấp hành Công đoàn",
      url: "/gioi-thieu#ban-chap-hanh-cong-doan",
      sortOrder: 10
    },
    {
      code: "about-child-cbcm",
      parentCode: "top-about",
      label: "Các ban chuyên môn",
      url: "/gioi-thieu#cac-ban-chuyen-mon",
      sortOrder: 20
    },
    { code: "about-child-lienhe", parentCode: "top-about", label: "Liên hệ", url: "/lien-he", sortOrder: 30 },
    { code: "activity-child-all", parentCode: "top-activity", label: "Tất cả tin tức", url: "/tin-tuc", sortOrder: 0 },
    { code: "document-child-all", parentCode: "top-document", label: "Tất cả văn bản", url: "/van-ban", sortOrder: 0 },
    {
      code: "document-child-outgoing",
      parentCode: "top-document",
      label: "Công văn đi",
      url: "/van-ban?direction=OUTGOING",
      sortOrder: 20
    },
    {
      code: "document-child-incoming",
      parentCode: "top-document",
      label: "Công văn đến",
      url: "/van-ban?direction=INCOMING",
      sortOrder: 30
    }
  ];
  for (const c of CHILD_MENU_SEED) {
    const parentId = topMenuIds.get(c.parentCode);
    if (!parentId) continue;
    await prisma.menuItem.upsert({
      where: { code: c.code },
      update: {},
      create: { code: c.code, label: c.label, url: c.url, sortOrder: c.sortOrder, parentId }
    });
  }

  // "Thông báo" (mục con "Văn bản") — web cũ lọc theo loại công văn (tblDocumentKind.Name), không có
  // id cố định để hard-code như các mục khác vì DocumentType được ETL từ dữ liệu thật của từng server
  // (mỗi lần chạy migrate-legacy-content.ts có thể sinh id UUID khác nhau) — tra theo đúng tên "Thông
  // báo" lúc seed, CHỈ thêm mục menu nếu tìm thấy loại công văn này thật sự tồn tại; bỏ qua êm nếu
  // chưa ETL hoặc tên khác đi, không tạo mục trỏ tới id rỗng/sai.
  const documentTopId = topMenuIds.get("top-document");
  if (documentTopId) {
    const thongBaoType = await prisma.documentType.findFirst({ where: { name: "Thông báo" } });
    if (thongBaoType) {
      await prisma.menuItem.upsert({
        where: { code: "document-child-thongbao" },
        update: {},
        create: {
          code: "document-child-thongbao",
          label: "Thông báo",
          url: `/van-ban?documentTypeId=${thongBaoType.id}`,
          sortOrder: 10,
          parentId: documentTopId
        }
      });
    } else {
      console.log('  (bỏ qua mục menu "Thông báo" — chưa tìm thấy loại công văn tên "Thông báo" trong CSDL)');
    }
  }

  // "Biểu mẫu Công đoàn" — DocumentType MỚI phục vụ tính năng Kho biểu mẫu (Tiện ích số, Phase 4a),
  // KHÔNG có trong dữ liệu ETL từ web cũ (web cũ trỏ thẳng /van-ban tới trang tải file tĩnh, không có
  // khái niệm loại công văn tương ứng — xem ghi chú CHILD_MENU_SEED ở trên). DocumentType không có
  // @unique trên `name` nên phải tự tra trước bằng findFirst rồi mới create, để chạy lại seed nhiều
  // lần không tạo trùng lặp (khác upsert theo code như các DocumentType khác vốn không áp dụng được ở
  // đây vì DocumentType này không có legacyCode để tra).
  console.log("Seeding loại công văn 'Biểu mẫu Công đoàn' (Kho biểu mẫu)...");
  const bieuMauType = await prisma.documentType.findFirst({ where: { name: "Biểu mẫu Công đoàn" } });
  if (!bieuMauType) {
    await prisma.documentType.create({
      data: {
        name: "Biểu mẫu Công đoàn",
        description: "Biểu mẫu, đơn từ dùng chung cho đoàn viên — hiển thị ở trang Kho biểu mẫu trong Tiện ích số."
      }
    });
  }

  // Cấu hình chung toàn site — chỉ "create" (update: {}), giữ đúng nội dung đang hard-code sẵn ở
  // Footer.tsx/Header.tsx làm giá trị khởi tạo để đổi sang lấy từ CSDL mà giao diện không đổi khác gì
  // — admin tự sửa qua trang "Cấu hình chung" sau lần seed đầu tiên, các lần seed sau không ghi đè.
  console.log("Seeding cấu hình chung (site settings)...");
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên",
      shortName: "Công đoàn UTEHY",
      slogan: "Đoàn kết – Trách nhiệm – Vì quyền lợi đoàn viên",
      description:
        "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên — tổ chức đại diện, bảo vệ quyền và lợi ích hợp pháp, chính đáng của cán bộ, giảng viên, người lao động nhà trường.",
      logoUrl: "/logo.png",
      address: "Xã Dân Tiến, Huyện Khoái Châu, Tỉnh Hưng Yên",
      hotline: "0962.490.411",
      officePhone: "03123.713.108",
      email: "congdoanutehy@gmail.com",
      workingHoursWeekday: "Thứ Hai – Thứ Sáu: 7h30 – 17h00",
      workingHoursLunch: "Nghỉ trưa: 11h30 – 13h30",
      workingHoursWeekend: "Thứ Bảy, Chủ nhật: Nghỉ",
      copyrightText: "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên. Bảo lưu mọi quyền.",
      seoTitle: "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên",
      seoDescription:
        "Cổng thông tin điện tử Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên — tin tức, hoạt động và tiện ích số dành cho đoàn viên.",
      seoKeywords: "công đoàn, UTEHY, công đoàn UTEHY, đại học sư phạm kỹ thuật hưng yên"
    }
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
