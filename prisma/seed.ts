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
import type { PublicServiceProcedureCategory } from "../packages/types/src/public-service";
import { seedUnionSatisfactionSurvey } from "./seed-survey-content";

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
  "unionterm",
  "unioncommitteemember",
  "contactmessage",
  "menuitem",
  "sitesetting",
  "event",
  "aitoolresource",
  "survey",
  "publicserviceprocedure",
  "publicservicelink",
  "publicservicesupportrequest",
  "publicservicenotice"
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
    "unionterm",
    "unioncommitteemember",
    "contactmessage",
    "menuitem",
    "event",
    "aitoolresource",
    "survey",
    "publicserviceprocedure",
    "publicservicelink",
    "publicservicesupportrequest",
    "publicservicenotice"
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

  // "Dịch vụ công" (Tiện ích số, Phase 4e) — nội dung mẫu do Claude soạn sẵn dựa trên quy định hiện
  // hành (tham khảo tại thời điểm soạn, KHÔNG chắc chắn còn đúng 100% do các cổng DVC/mức phí/thời hạn
  // xử lý thường xuyên thay đổi — đặc biệt sau đợt hợp nhất "Cổng DVC Quốc gia thành điểm một cửa số"
  // từ 1/7/2025). TẤT CẢ seed với isActive=false — cán bộ Công đoàn PHẢI tự rà soát, sửa lại cho đúng
  // thực tế rồi mới bật hiển thị công khai qua trang quản trị "Thủ tục dịch vụ công". Chỉ "create"
  // (update: {}) như các bảng mẫu khác — không ghi đè nội dung admin đã tự sửa ở các lần seed sau.
  console.log("Seeding thủ tục dịch vụ công mẫu (Dịch vụ công — Phase 4e, chờ Công đoàn rà soát)...");
  interface ProcedureSeed {
    slug: string;
    title: string;
    category: PublicServiceProcedureCategory;
    summary: string;
    conditions: string;
    requiredDocuments: string;
    whereToApply: string;
    steps: string;
    fee: string;
    processingTime: string;
    resultDelivery: string;
    commonMistakes: string;
  }
  const PUBLIC_SERVICE_PROCEDURE_SEED: ProcedureSeed[] = [
    {
      slug: "cap-doi-the-can-cuoc",
      title: "Cấp, đổi thẻ Căn cước",
      category: "CAN_CUOC",
      summary: "Cấp mới khi đủ 14 tuổi, hoặc đổi khi thẻ hết hạn/thay đổi thông tin/thẻ hư hỏng.",
      conditions:
        "Công dân Việt Nam đủ 14 tuổi trở lên (cấp lần đầu); hoặc thuộc diện phải đổi thẻ: hết thời hạn sử dụng (thẻ hết hạn theo mốc 14/25/40/60 tuổi), thay đổi thông tin hộ tịch (họ tên, ngày sinh, giới tính, quê quán, nơi thường trú...), thẻ bị hư hỏng/mất, hoặc có sai sót thông tin trên thẻ.",
      requiredDocuments:
        "Không cần mang giấy tờ nếu đã có thông tin trong Cơ sở dữ liệu quốc gia về dân cư và đăng ký online; nếu đăng ký trực tiếp: giấy tờ chứng minh nơi thường trú/tạm trú, giấy tờ chứng minh thông tin thay đổi (nếu đổi thẻ do thay đổi thông tin). Người dưới 14 tuổi cần người đại diện hợp pháp đi cùng.",
      whereToApply:
        "Công an cấp huyện/cấp xã nơi thường trú hoặc tạm trú (không phân biệt nơi đăng ký hộ khẩu); hoặc đăng ký trước qua Cổng Dịch vụ công Quốc gia/Cổng DVC Bộ Công an rồi tới điểm thu nhận để chụp ảnh, lấy vân tay, mống mắt.",
      steps:
        "1) Đăng ký lịch hẹn online trên Cổng Dịch vụ công Quốc gia hoặc VNeID (mục Thủ tục hành chính > Cấp, đổi, cấp lại thẻ Căn cước). 2) Điền tờ khai, xác nhận thông tin cư trú/hộ tịch hiện có. 3) Đến điểm thu nhận đúng lịch hẹn để chụp ảnh chân dung, thu vân tay, mống mắt (bắt buộc có mặt trực tiếp). 4) Nhận giấy hẹn trả kết quả. 5) Nhận thẻ Căn cước theo hình thức đã đăng ký (trực tiếp hoặc qua bưu điện).",
      fee: "Có lệ phí theo quy định hiện hành của Bộ Tài chính, miễn/giảm với một số trường hợp (cấp lần đầu, dưới 14 tuổi...) — cán bộ Công đoàn kiểm tra mức phí mới nhất trước khi công khai vì mức phí có thể điều chỉnh theo từng giai đoạn.",
      processingTime:
        "Thông thường 7-15 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ (nhanh hơn ở cấp xã/thành phố lớn, có thể lâu hơn ở địa bàn xa) — cần xác nhận lại thời hạn cụ thể theo thông báo tại nơi nộp hồ sơ.",
      resultDelivery:
        "Nhận trực tiếp tại nơi nộp hồ sơ theo giấy hẹn, hoặc đăng ký nhận qua dịch vụ bưu chính công ích (trả phí vận chuyển) — có thể tra cứu tiến độ xử lý online trên Cổng DVC/VNeID.",
      commonMistakes:
        "Quên mang/không cập nhật giấy tờ chứng minh nơi cư trú hiện tại; đặt lịch hẹn nhưng không đến đúng giờ khiến phải đặt lại; thông tin cá nhân (họ tên đệm, ngày sinh) trên các giấy tờ khác không khớp dữ liệu dân cư dẫn đến phải xác minh bổ sung, kéo dài thời gian xử lý."
    },
    {
      slug: "xac-nhan-thong-tin-cu-tru",
      title: "Đăng ký thường trú / Xác nhận thông tin cư trú",
      category: "CU_TRU",
      summary: "Đăng ký nơi thường trú mới hoặc xin xác nhận thông tin cư trú (thay cho sổ hộ khẩu giấy đã bỏ).",
      conditions:
        "Có chỗ ở hợp pháp thuộc quyền sở hữu, hoặc được chủ hộ/chủ sở hữu chỗ ở hợp pháp đồng ý cho đăng ký thường trú (có văn bản đồng ý); trường hợp thuê/mượn/ở nhờ cần đáp ứng điều kiện diện tích tối thiểu theo quy định của địa phương.",
      requiredDocuments:
        "Tờ khai thay đổi thông tin cư trú (mẫu CT01, có thể điền online); giấy tờ chứng minh chỗ ở hợp pháp (giấy chứng nhận quyền sử dụng đất/sở hữu nhà, hợp đồng thuê nhà đã công chứng...); văn bản đồng ý của chủ hộ/chủ sở hữu (nếu không phải chủ hộ đăng ký).",
      whereToApply:
        "Công an cấp xã nơi dự kiến đăng ký thường trú; hoặc nộp online qua Cổng Dịch vụ công Quốc gia/Cổng DVC Bộ Công an (mục Cư trú) — không cần đến trực tiếp nếu hồ sơ điện tử được chấp nhận.",
      steps:
        "1) Chuẩn bị hồ sơ giấy tờ chứng minh chỗ ở hợp pháp. 2) Nộp hồ sơ online (đính kèm bản scan) hoặc trực tiếp tại Công an cấp xã. 3) Theo dõi trạng thái xử lý trên Cổng DVC/VNeID. 4) Bổ sung hồ sơ nếu được yêu cầu. 5) Nhận kết quả — thông tin cư trú được cập nhật trong Cơ sở dữ liệu quốc gia về dân cư (không còn cấp sổ hộ khẩu giấy), có thể xin Giấy xác nhận thông tin cư trú khi cần dùng cho thủ tục khác.",
      fee: "Đăng ký thường trú: theo lệ phí cư trú do HĐND cấp tỉnh quy định (thường vài chục nghìn đồng, một số nơi miễn khi nộp online). Xác nhận thông tin cư trú: theo quy định hiện hành, cần kiểm tra tại địa phương.",
      processingTime: "Thông thường không quá 7 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ.",
      resultDelivery:
        "Thông báo kết quả qua Cổng DVC/VNeID hoặc tin nhắn; Giấy xác nhận thông tin cư trú (nếu có yêu cầu) nhận trực tiếp hoặc qua bưu điện.",
      commonMistakes:
        "Giấy tờ chứng minh chỗ ở hợp pháp không hợp lệ (hợp đồng thuê nhà chưa công chứng/chứng thực); thiếu văn bản đồng ý của chủ hộ; nhầm lẫn giữa đăng ký thường trú (đổi nơi cư trú chính thức) và xin xác nhận thông tin cư trú (chỉ để dùng cho 1 thủ tục cụ thể, không làm thay đổi nơi thường trú)."
    },
    {
      slug: "dang-ky-khai-sinh",
      title: "Đăng ký khai sinh cho con",
      category: "HO_TICH",
      summary: "Đăng ký khai sinh lần đầu cho trẻ mới sinh, có thể thực hiện liên thông với cấp thẻ BHYT và đăng ký thường trú.",
      conditions:
        "Trẻ mới sinh chưa được đăng ký khai sinh; cha/mẹ hoặc người thân thích, người giám hộ có trách nhiệm đi đăng ký trong thời hạn 60 ngày kể từ ngày sinh.",
      requiredDocuments:
        "Tờ khai đăng ký khai sinh (mẫu, có thể điền online); Giấy chứng sinh do cơ sở y tế nơi trẻ sinh ra cấp (hoặc giấy tờ thay thế nếu sinh ngoài cơ sở y tế); giấy tờ tuỳ thân của cha/mẹ (căn cước); giấy chứng nhận kết hôn (nếu cha mẹ có đăng ký kết hôn).",
      whereToApply:
        "UBND cấp xã nơi cư trú của cha hoặc mẹ; có thể nộp online qua Cổng Dịch vụ công Quốc gia/Cổng DVC của địa phương, chọn nhóm thủ tục liên thông \"Đăng ký khai sinh - Đăng ký thường trú - Cấp thẻ BHYT cho trẻ dưới 6 tuổi\" để làm 1 lần.",
      steps:
        "1) Chuẩn bị Giấy chứng sinh và giấy tờ cha/mẹ. 2) Nộp hồ sơ online (khuyến khích chọn thủ tục liên thông) hoặc trực tiếp tại UBND cấp xã. 3) Cán bộ tư pháp - hộ tịch kiểm tra, đối chiếu thông tin. 4) Nhận Giấy khai sinh bản chính. 5) Nếu làm liên thông: hồ sơ tự động chuyển tiếp để đăng ký thường trú và cấp thẻ BHYT cho trẻ mà không cần nộp lại.",
      fee: "Miễn lệ phí đăng ký khai sinh lần đầu theo quy định hiện hành.",
      processingTime: "Trong ngày làm việc nếu hồ sơ đầy đủ, hợp lệ; thủ tục liên thông có thể kéo dài hơn (thường không quá vài ngày làm việc).",
      resultDelivery: "Nhận trực tiếp Giấy khai sinh bản chính tại UBND cấp xã, hoặc qua dịch vụ bưu chính công ích nếu đăng ký online và chọn nhận kết quả tại nhà.",
      commonMistakes:
        "Chậm quá thời hạn 60 ngày khiến phải làm thủ tục đăng ký khai sinh quá hạn (thêm bước xác minh); thông tin họ tên đệm của con không thống nhất giữa Giấy chứng sinh và mong muốn đặt tên; cha mẹ chưa đăng ký kết hôn nhưng khai thông tin cha trong giấy khai sinh mà chưa làm thủ tục nhận cha cho con trước."
    },
    {
      slug: "cap-lai-the-bhyt-tra-cuu-qua-trinh-dong-bhxh",
      title: "Cấp lại thẻ BHYT / Tra cứu quá trình đóng BHXH",
      category: "BHXH_BHYT",
      summary: "Xin cấp lại thẻ BHYT khi mất/hỏng, hoặc tra cứu quá trình đóng BHXH, BHYT, BHTN của bản thân.",
      conditions:
        "Đã có mã số BHXH/thẻ BHYT trước đó; thẻ BHYT bị mất, hỏng, hoặc thay đổi thông tin cần cấp lại. Tra cứu quá trình đóng: áp dụng cho người đang tham gia hoặc đã từng tham gia BHXH.",
      requiredDocuments:
        "Không cần giấy tờ nếu tra cứu/cấp lại online qua ứng dụng VssID hoặc Cổng Dịch vụ công BHXH Việt Nam (xác thực bằng tài khoản định danh điện tử VNeID); nếu làm trực tiếp: căn cước công dân/thẻ căn cước, tờ khai cấp lại thẻ BHYT (mẫu TK1-TS).",
      whereToApply:
        "Ứng dụng VssID hoặc Cổng Dịch vụ công của Bảo hiểm xã hội Việt Nam (tự thao tác từ xa); hoặc cơ quan BHXH cấp huyện nơi cư trú/nơi đơn vị đóng BHXH.",
      steps:
        "1) Đăng nhập VssID/Cổng DVC BHXH bằng tài khoản VNeID mức 2. 2) Chọn chức năng \"Cấp lại thẻ BHYT do hỏng, mất\" hoặc \"Tra cứu quá trình tham gia BHXH, BHYT, BHTN\". 3) Với cấp lại thẻ: điền thông tin, gửi yêu cầu, có thể dùng ngay thẻ BHYT điện tử trên VssID/VNeID trong khi chờ thẻ cứng (nếu vẫn cần). 4) Với tra cứu: xem trực tiếp kết quả quá trình đóng theo từng đơn vị, từng giai đoạn.",
      fee: "Không mất phí cấp lại thẻ BHYT do lỗi từ cơ quan BHXH; có thể mất phí nếu cấp lại do lỗi của người tham gia (mức phí theo quy định hiện hành, cần kiểm tra lại).",
      processingTime: "Cấp lại thẻ BHYT: không quá 2 ngày làm việc (7 ngày nếu phải thay đổi nơi khám chữa bệnh ban đầu). Tra cứu quá trình đóng: tức thời trên VssID/Cổng DVC.",
      resultDelivery: "Thẻ BHYT điện tử dùng ngay trên VssID/VNeID; thẻ BHYT giấy (nếu có yêu cầu) nhận qua bưu điện hoặc tại cơ quan BHXH.",
      commonMistakes:
        "Nhầm lẫn mã số BHXH và số thẻ BHYT (2 mã khác nhau); không cập nhật số điện thoại/CCCD mới nhất trong dữ liệu BHXH khiến không đăng nhập/xác thực được VssID; tưởng phải luôn có thẻ giấy trong khi thẻ BHYT điện tử trên VssID/VNeID đã có giá trị sử dụng khi đi khám chữa bệnh."
    },
    {
      slug: "quyet-toan-thue-thu-nhap-ca-nhan",
      title: "Quyết toán thuế thu nhập cá nhân",
      category: "THUE_TNCN",
      summary: "Tự quyết toán thuế TNCN với cơ quan thuế (áp dụng khi có số thuế nộp thừa cần hoàn, hoặc thuộc diện phải tự quyết toán).",
      conditions:
        "Cá nhân có thu nhập từ tiền lương, tiền công thuộc diện phải quyết toán trực tiếp (có từ 2 nguồn thu nhập trở lên và không uỷ quyền quyết toán cho đơn vị chi trả, hoặc có số thuế nộp thừa muốn hoàn/bù trừ), hoặc chủ động quyết toán để xin hoàn thuế.",
      requiredDocuments:
        "Tài khoản giao dịch thuế điện tử cá nhân (đăng ký qua Cổng Dịch vụ công Quốc gia bằng VNeID hoặc trực tiếp trên Cổng DVC ngành Thuế); chứng từ khấu trừ thuế TNCN do đơn vị chi trả thu nhập cấp; hồ sơ chứng minh người phụ thuộc (nếu đăng ký giảm trừ gia cảnh).",
      whereToApply:
        "Cổng Dịch vụ công Quốc gia (liên thông với ngành Thuế) hoặc trực tiếp Cổng Dịch vụ công/eTax của cơ quan thuế; có thể nộp hồ sơ giấy tại Chi cục Thuế nơi cư trú nếu không quyết toán online.",
      steps:
        "1) Đăng nhập Cổng DVC Quốc gia/Cổng DVC ngành Thuế bằng tài khoản định danh điện tử. 2) Tờ khai quyết toán thuế TNCN thường được hệ thống gợi ý sẵn dữ liệu thu nhập, số thuế đã khấu trừ (từ dữ liệu đơn vị chi trả đã báo cáo). 3) Kiểm tra, bổ sung thông tin người phụ thuộc/khoản giảm trừ nếu có. 4) Nộp tờ khai, hệ thống tự tính số thuế phải nộp thêm hoặc được hoàn. 5) Theo dõi kết quả xử lý và nhận tiền hoàn thuế (nếu có) qua tài khoản ngân hàng đã đăng ký.",
      fee: "Không mất phí quyết toán/hoàn thuế TNCN.",
      processingTime: "Thời hạn nộp hồ sơ quyết toán thường chậm nhất ngày cuối tháng 3 hằng năm (đối với cá nhân tự quyết toán) — thời gian xử lý hoàn thuế theo quy định của Luật Quản lý thuế (thường trong khoảng vài tuần đến 40 ngày tuỳ hồ sơ thuộc diện hoàn trước/kiểm tra sau hay kiểm tra trước/hoàn sau).",
      resultDelivery: "Thông báo kết quả xử lý qua Cổng DVC/eTax; tiền hoàn thuế (nếu có) chuyển khoản trực tiếp vào tài khoản ngân hàng cá nhân đã đăng ký.",
      commonMistakes:
        "Quên chốt/xin lại chứng từ khấu trừ thuế TNCN từ đơn vị cũ khi đã chuyển công tác trong năm; khai trùng hoặc thiếu người phụ thuộc; nộp hồ sơ trễ hạn khiến bị tính chậm nộp (nếu còn số thuế phải nộp thêm) dù có thể không bị phạt nếu chỉ chậm với trường hợp được hoàn thuế."
    },
    {
      slug: "cap-phieu-ly-lich-tu-phap",
      title: "Cấp Phiếu lý lịch tư pháp",
      category: "LY_LICH_TU_PHAP",
      summary: "Xin cấp Phiếu lý lịch tư pháp số 1 hoặc số 2 phục vụ xin việc, làm hồ sơ, thủ tục hành chính khác.",
      conditions:
        "Công dân Việt Nam, người nước ngoài đã/đang cư trú tại Việt Nam có nhu cầu xác nhận về tình trạng án tích của bản thân (Phiếu số 1: cấp cho cá nhân/cơ quan, tổ chức phục vụ quản lý nhân sự, xin việc; Phiếu số 2: cấp cho cơ quan tố tụng hoặc cá nhân có yêu cầu tìm hiểu về chính mình).",
      requiredDocuments:
        "Tờ khai yêu cầu cấp Phiếu lý lịch tư pháp (mẫu, có thể điền online); bản chụp căn cước/hộ chiếu còn hiệu lực; giấy uỷ quyền (nếu nhờ người khác nộp thay, trừ trường hợp cha mẹ/vợ chồng/con nộp thay không cần uỷ quyền).",
      whereToApply:
        "Sở Tư pháp nơi thường trú (hoặc tạm trú nếu không có nơi thường trú); hoặc nộp online qua Cổng Dịch vụ công Quốc gia/Cổng DVC của Sở Tư pháp tỉnh/thành phố.",
      steps:
        "1) Điền tờ khai yêu cầu cấp Phiếu lý lịch tư pháp online hoặc lấy mẫu tại Sở Tư pháp. 2) Đính kèm bản chụp căn cước, nộp phí trực tuyến (nếu nộp online). 3) Hệ thống/cán bộ tiếp nhận xác minh thông tin án tích qua Cơ sở dữ liệu lý lịch tư pháp. 4) Theo dõi tiến độ xử lý trên Cổng DVC. 5) Nhận kết quả theo hình thức đã đăng ký (trực tiếp hoặc qua bưu điện).",
      fee: "Theo quy định hiện hành của Bộ Tài chính (mức phí có thể khác nhau giữa Phiếu số 1 và số 2, có ưu đãi cho một số đối tượng) — cần xác nhận mức phí mới nhất tại Sở Tư pháp trước khi công khai.",
      processingTime: "Thông thường không quá 10 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ; có thể kéo dài với trường hợp phải xác minh thêm (đã từng cư trú/công tác ở nhiều nơi, có yếu tố nước ngoài...).",
      resultDelivery: "Nhận trực tiếp tại Sở Tư pháp theo giấy hẹn, hoặc qua dịch vụ bưu chính công ích nếu đăng ký online và chọn nhận tại nhà.",
      commonMistakes:
        "Không kê khai đầy đủ quá trình cư trú (từng ở nhiều tỉnh/thành phố) khiến thời gian xác minh kéo dài; nhầm giữa Phiếu số 1 và số 2 dẫn tới phải làm lại; thông tin trên tờ khai không khớp với căn cước hiện tại (đã đổi CCCD/Căn cước nhưng khai theo số CMND cũ)."
    },
    {
      slug: "doi-giay-phep-lai-xe",
      title: "Đổi giấy phép lái xe (GPLX)",
      category: "GPLX",
      summary: "Đổi GPLX khi hết hạn, hỏng, hoặc đổi từ GPLX bằng giấy sang thẻ PET (vật liệu nhựa cứng có mã QR).",
      conditions:
        "GPLX hết thời hạn sử dụng (thường 10 năm với hạng A1/A2/B, ngắn hơn với các hạng lái xe kinh doanh vận tải), bị hư hỏng, hoặc thuộc diện GPLX bằng giấy còn hạn nhưng người dân chủ động đổi sang thẻ PET; không thuộc trường hợp bị tước quyền sử dụng GPLX.",
      requiredDocuments:
        "Đơn đề nghị đổi GPLX (mẫu, có thể điền online); GPLX cũ (bản scan khi nộp online, bản gốc khi nộp trực tiếp); giấy khám sức khoẻ do cơ sở y tế đủ điều kiện cấp (còn hiệu lực, thường trong 6 tháng gần nhất) — bắt buộc với đa số trường hợp đổi GPLX; ảnh chân dung theo yêu cầu.",
      whereToApply:
        "Sở Giao thông vận tải (hoặc cơ quan quản lý sát hạch, cấp GPLX theo phân cấp hiện hành của địa phương) nơi thuận tiện, không bắt buộc theo hộ khẩu thường trú; có thể nộp online qua Cổng Dịch vụ công Quốc gia.",
      steps:
        "1) Khám sức khoẻ tại cơ sở y tế đủ điều kiện, lấy giấy khám sức khoẻ lái xe. 2) Điền đơn đề nghị đổi GPLX online, đính kèm ảnh, giấy khám sức khoẻ, bản scan GPLX cũ. 3) Nộp phí trực tuyến. 4) Đến điểm hẹn (nếu được yêu cầu) để đối chiếu bản gốc GPLX cũ. 5) Nhận GPLX mới theo hình thức đã đăng ký.",
      fee: "Theo quy định hiện hành của Bộ Tài chính, mức phí đổi GPLX tương đối thấp — cần xác nhận mức phí mới nhất trước khi công khai.",
      processingTime: "Thông thường không quá 5 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ (nộp online tại nhiều địa phương đã cho trả kết quả nhanh hơn).",
      resultDelivery: "Nhận trực tiếp tại cơ quan cấp GPLX theo giấy hẹn, hoặc qua dịch vụ bưu chính công ích nếu đăng ký online và chọn nhận tại nhà.",
      commonMistakes:
        "Giấy khám sức khoẻ hết hiệu lực hoặc khám không đúng cơ sở đủ điều kiện theo quy định của ngành Giao thông vận tải; nộp hồ sơ khi GPLX đã quá hạn quá lâu (một số trường hợp GPLX quá hạn trên 3 tháng/1 năm phải sát hạch lại thay vì chỉ đổi) — cần kiểm tra kỹ thời hạn trước khi làm thủ tục để tránh phải thi lại."
    },
    {
      slug: "dang-ky-xe-mo-to-xe-gan-may",
      title: "Đăng ký xe mô tô, xe gắn máy",
      category: "DANG_KY_PHUONG_TIEN",
      summary: "Đăng ký xe mới mua, sang tên đổi chủ, hoặc cấp lại giấy đăng ký xe/biển số bị mất, hỏng.",
      conditions:
        "Chủ xe là cá nhân/tổ chức có xe mô tô, xe gắn máy hợp pháp (có hoá đơn/chứng từ chuyển nhượng hợp lệ đối với xe mua bán, hoặc xe nhập khẩu/sản xuất lắp ráp trong nước có đầy đủ giấy tờ nguồn gốc).",
      requiredDocuments:
        "Giấy khai đăng ký xe (mẫu, có thể điền online); giấy tờ nguồn gốc xe (hoá đơn bán hàng/phiếu xuất kho, tờ khai hải quan nếu xe nhập khẩu); giấy tờ chứng minh nơi cư trú của chủ xe; giấy tờ chuyển nhượng nếu sang tên (hợp đồng mua bán đã công chứng/chứng thực hoặc xác nhận qua Cổng DVC).",
      whereToApply:
        "Công an cấp xã/cấp huyện nơi chủ xe cư trú (theo phân cấp đăng ký xe hiện hành — xe mô tô, xe gắn máy đã phân cấp đăng ký về cấp xã ở nhiều địa phương); có thể đặt lịch hẹn/nộp hồ sơ trước qua Cổng Dịch vụ công Quốc gia.",
      steps:
        "1) Chuẩn bị đầy đủ giấy tờ nguồn gốc xe và giấy tờ chủ xe. 2) Đăng ký lịch hẹn/nộp hồ sơ online qua Cổng DVC (nếu địa phương đã triển khai) hoặc nộp trực tiếp. 3) Đưa xe đến để cán bộ đăng ký kiểm tra thực tế (đối chiếu số khung, số máy). 4) Nộp lệ phí trước bạ (tại cơ quan Thuế hoặc liên thông qua Cổng DVC) và lệ phí đăng ký, cấp biển số. 5) Nhận Giấy chứng nhận đăng ký xe và biển số.",
      fee: "Gồm lệ phí trước bạ (theo tỷ lệ % giá trị xe, do UBND cấp tỉnh quy định cụ thể theo từng địa phương) và lệ phí cấp biển số, đăng ký xe theo quy định hiện hành — cần xác nhận mức cụ thể tại địa phương trước khi công khai.",
      processingTime: "Thường trong ngày làm việc nếu hồ sơ đầy đủ, hợp lệ và xe đưa đến kiểm tra thực tế đúng lịch hẹn.",
      resultDelivery: "Nhận trực tiếp Giấy chứng nhận đăng ký xe và biển số tại nơi đăng ký sau khi hoàn tất kiểm tra thực tế xe và nộp đủ lệ phí.",
      commonMistakes:
        "Chưa nộp lệ phí trước bạ trước khi đăng ký (hoặc nộp sai nơi) khiến hồ sơ bị trả lại; giấy tờ chuyển nhượng (mua bán xe cũ) chưa công chứng/chứng thực hợp lệ; đưa xe không đúng số khung/số máy khai báo trong hồ sơ."
    },
    {
      slug: "dang-ky-tai-khoan-dinh-danh-dien-tu-vneid",
      title: "Đăng ký tài khoản định danh điện tử (VNeID)",
      category: "KHAC",
      summary: "Đăng ký, kích hoạt tài khoản định danh điện tử mức 1/mức 2 — điều kiện bắt buộc để dùng hầu hết dịch vụ công trực tuyến hiện nay.",
      conditions:
        "Công dân Việt Nam từ đủ 14 tuổi trở lên đã có thẻ Căn cước/CCCD gắn chip (dưới 14 tuổi được đăng ký theo tài khoản của cha, mẹ hoặc người giám hộ); có số điện thoại chính chủ để nhận mã OTP.",
      requiredDocuments:
        "Thẻ Căn cước/CCCD gắn chip còn hiệu lực; số điện thoại chính chủ đã đăng ký với nhà mạng; email (không bắt buộc nhưng nên có để khôi phục tài khoản).",
      whereToApply:
        "Tự đăng ký tài khoản mức 1 ngay trên ứng dụng VNeID (tải từ App Store/CH Play); để kích hoạt tài khoản mức 2 (dùng được đầy đủ dịch vụ, thay thế nhiều giấy tờ) cần đến Công an cấp xã/cấp huyện để xác thực sinh trắc học (vân tay, khuôn mặt) trực tiếp 1 lần duy nhất.",
      steps:
        "1) Tải ứng dụng VNeID, đăng ký tài khoản mức 1 bằng số điện thoại và thông tin căn cước. 2) Đặt lịch hẹn (qua ứng dụng hoặc trực tiếp) đến Công an để xác thực sinh trắc học, kích hoạt tài khoản mức 2. 3) Sau khi được kích hoạt, đăng nhập lại VNeID, xác nhận các thông tin tích hợp (BHXH, GPLX, đăng ký xe, thông tin cư trú...). 4) Dùng tài khoản VNeID mức 2 để đăng nhập Cổng Dịch vụ công Quốc gia và các cổng dịch vụ công chuyên ngành (BHXH, Thuế, Công an, Giao thông vận tải...) mà không cần đăng ký tài khoản riêng ở từng nơi.",
      fee: "Miễn phí đăng ký và kích hoạt tài khoản định danh điện tử.",
      processingTime: "Đăng ký tài khoản mức 1: ngay lập tức trên ứng dụng. Kích hoạt tài khoản mức 2: thường trong vòng vài ngày làm việc sau khi xác thực sinh trắc học trực tiếp.",
      resultDelivery: "Thông báo kích hoạt thành công qua ứng dụng VNeID/tin nhắn; sử dụng ngay tài khoản để đăng nhập các cổng dịch vụ công.",
      commonMistakes:
        "Chỉ dừng ở tài khoản mức 1 (không đến xác thực sinh trắc học) nên không dùng được đầy đủ tính năng, không đăng nhập được nhiều cổng DVC chuyên ngành yêu cầu mức 2; số điện thoại đăng ký không chính chủ khiến không nhận được OTP khôi phục khi cần; quên mật khẩu/mã PIN mà không cập nhật email khôi phục từ đầu."
    }
  ];
  for (const p of PUBLIC_SERVICE_PROCEDURE_SEED) {
    await prisma.publicServiceProcedure.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, isActive: false }
    });
  }

  // Kho biểu mẫu và đường dẫn chính thống (nhóm 3) — cùng lý do isActive=false như thủ tục ở trên: các
  // cổng DVC chuyên ngành đổi tên miền/cấu trúc khá thường xuyên (vd Cổng DVC Quốc gia đã hợp nhất
  // thành "điểm một cửa số" từ 1/7/2025) — cán bộ Công đoàn PHẢI tự kiểm tra link còn hoạt động đúng
  // trước khi bật hiển thị công khai. QR code hiển thị tự động ở FE từ field `url`, không cần thêm gì.
  console.log("Seeding kho liên kết dịch vụ công mẫu (chờ Công đoàn xác minh link trước khi bật)...");
  const PUBLIC_SERVICE_LINK_SEED = [
    {
      title: "Cổng Dịch vụ công Quốc gia",
      url: "https://dichvucong.gov.vn",
      description: "Điểm một cửa số quốc gia — thực hiện hầu hết thủ tục hành chính công trực tuyến, đăng nhập bằng tài khoản VNeID.",
      group: "Cổng Dịch vụ công Quốc gia",
      sortOrder: 0
    },
    {
      title: "VNeID — Định danh điện tử",
      url: "https://vneid.gov.vn",
      description: "Ứng dụng định danh điện tử quốc gia — bắt buộc để đăng nhập hầu hết các cổng dịch vụ công hiện nay.",
      group: "Định danh điện tử",
      sortOrder: 10
    },
    {
      title: "Bảo hiểm xã hội Việt Nam",
      url: "https://baohiemxahoi.gov.vn",
      description: "Tra cứu quá trình đóng BHXH/BHYT/BHTN, cấp lại thẻ BHYT — có thể dùng kèm ứng dụng VssID.",
      group: "BHXH Việt Nam",
      sortOrder: 20
    },
    {
      title: "Cổng Dịch vụ công ngành Thuế",
      url: "https://dichvucong.gdt.gov.vn",
      description: "Kê khai, quyết toán thuế thu nhập cá nhân, tra cứu nghĩa vụ thuế trực tuyến.",
      group: "Cơ quan thuế",
      sortOrder: 30
    },
    {
      title: "Cổng Dịch vụ công Bộ Công an",
      url: "https://dichvucong.bocongan.gov.vn",
      description: "Thủ tục về căn cước, cư trú, đăng ký phương tiện và các thủ tục khác thuộc ngành Công an.",
      group: "Cổng chuyên ngành khác",
      sortOrder: 40
    }
  ];
  for (const link of PUBLIC_SERVICE_LINK_SEED) {
    const existing = await prisma.publicServiceLink.findFirst({ where: { url: link.url } });
    if (!existing) {
      await prisma.publicServiceLink.create({ data: { ...link, isActive: false } });
    }
  }

  // Thông báo chào mừng tính năng mới (nhóm 5) — nội dung trung tính, không có rủi ro pháp lý như các
  // thủ tục/link ở trên nên seed isActive=true luôn được (khác quyết định thận trọng ở 2 khối trên).
  console.log("Seeding thông báo chào mừng tính năng Dịch vụ công...");
  const welcomeNoticeExists = await prisma.publicServiceNotice.findFirst({
    where: { title: "Ra mắt tính năng \"Dịch vụ công\" trong Tiện ích số Công đoàn" }
  });
  if (!welcomeNoticeExists) {
    await prisma.publicServiceNotice.create({
      data: {
        title: 'Ra mắt tính năng "Dịch vụ công" trong Tiện ích số Công đoàn',
        content:
          'Công đoàn trường ra mắt chuyên mục "Dịch vụ công" trong Tiện ích số — giúp viên chức, người lao động tra cứu nhanh thủ tục hành chính thường gặp, xem hướng dẫn từng bước, kho liên kết tới các cổng dịch vụ công chính thống, và đặc biệt là gửi yêu cầu "Công đoàn hỗ trợ tôi" khi vướng mắc ở bất kỳ bước nào. Mời các đồng chí đoàn viên trải nghiệm và góp ý để Công đoàn hoàn thiện thêm.',
        category: "NEW_SERVICE",
        isPinned: true,
        isActive: true
      }
    });
  }

  console.log("Seeding khảo sát ý kiến đoàn viên (nội dung chính thức, thay bản test)...");
  await seedUnionSatisfactionSurvey(prisma);

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
