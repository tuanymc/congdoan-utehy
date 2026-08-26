import { randomUUID } from "node:crypto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DIGITAL_HANDBOOK_CATEGORY_SLUG, type MenuItemDto, type PublicMenuItemDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";

/** Slug chuyên mục KHÔNG tự động liệt kê vào dropdown có autoCategoryChildren=true dù isAboutSection
 * =false — vì đã có mục menu riêng trỏ thẳng tới ("tin-tuc-khac" -> "Ý kiến Công đoàn viên",
 * "van-hoa-doc" -> "Văn hóa đọc"), hoặc vì tên chuyên mục trùng với 1 khu vực khác của site nhưng
 * không phải cùng nội dung ("van-ban"/"tin-chung" là chuyên mục bài viết thật, không phải trang Văn
 * bản/Công văn). "cam-nang-kien-thuc-so" thuộc Tiện ích số, không phải Tin hoạt động. Giữ y hệt danh
 * sách loại trừ từng hard-code ở apps/web Header.tsx trước khi menu được đưa vào quản lý qua admin
 * (xem lịch sử đổi menu trong git log Header.tsx). */
const AUTO_CATEGORY_EXCLUDED_SLUGS = new Set([
  "gioi-thieu",
  "van-ban",
  "tin-chung",
  "tin-tuc-khac",
  "van-hoa-doc",
  DIGITAL_HANDBOOK_CATEGORY_SLUG
]);

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  /** Quản trị — toàn bộ mục menu (kể cả đang ẩn), sắp theo sortOrder. SQL Server mặc định xếp NULL
   * lên đầu khi ASC nên mục cấp 1 (parentId=null) tự nhiên đứng trước mục con — trang admin tự dựng
   * cây từ danh sách phẳng này (xem MenuItemList.tsx), không cần Prisma sắp NULL riêng. */
  async listForAdmin(): Promise<MenuItemDto[]> {
    return this.prisma.menuItem.findMany({ orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }] });
  }

  async findOne(id: string): Promise<MenuItemDto> {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Không tìm thấy mục menu.");
    return item;
  }

  async create(dto: CreateMenuItemDto, actorUserId: string): Promise<MenuItemDto> {
    const parentId = dto.parentId ?? null;
    await this.assertValidParent(null, parentId);
    if (dto.autoCategoryChildren && parentId) {
      throw new BadRequestException("Chỉ mục cấp 1 (không có mục cha) mới có thể tự động liệt kê chuyên mục.");
    }

    const item = await this.prisma.menuItem.create({
      data: {
        // SQL Server chỉ cho phép TỐI ĐA 1 dòng có giá trị NULL trên cột có UNIQUE constraint (khác
        // Postgres/MySQL cho phép nhiều NULL) — nếu để `code` là null cho mọi mục do admin tự tạo thì
        // mục thứ 2 trở đi sẽ luôn văng lỗi "Unique constraint failed on dbo.menu_items". `code` chỉ
        // thực sự cần thiết để seed.ts upsert lại an toàn (xem ghi chú field trong schema.prisma) —
        // mục do admin tạo không bao giờ được seed.ts đụng tới, nên sinh 1 giá trị ngẫu nhiên duy nhất
        // ở đây là đủ, KHÔNG cần đổi schema (không cần migration).
        code: randomUUID(),
        label: dto.label,
        url: dto.url,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        autoCategoryChildren: dto.autoCategoryChildren ?? false,
        parentId
      }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "MenuItem", entityId: item.id });
    return item;
  }

  async update(id: string, dto: UpdateMenuItemDto, actorUserId: string): Promise<MenuItemDto> {
    const existing = await this.findOne(id);

    if (dto.parentId !== undefined) {
      await this.assertValidParent(id, dto.parentId);
    }

    // "Tự động liệt kê chuyên mục" chỉ hợp lệ với mục cấp 1 — kiểm tra theo trạng thái parentId SAU
    // khi áp dụng thay đổi (dto.parentId nếu có gửi lên, không thì giữ nguyên parentId hiện tại).
    const nextParentId = dto.parentId !== undefined ? dto.parentId : existing.parentId;
    const nextAutoCategoryChildren = dto.autoCategoryChildren ?? existing.autoCategoryChildren;
    if (nextAutoCategoryChildren && nextParentId) {
      throw new BadRequestException("Chỉ mục cấp 1 (không có mục cha) mới có thể tự động liệt kê chuyên mục.");
    }

    const item = await this.prisma.menuItem.update({
      where: { id },
      data: {
        label: dto.label,
        url: dto.url,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
        autoCategoryChildren: dto.autoCategoryChildren,
        parentId: dto.parentId
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "MenuItem", entityId: id });
    return item;
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    // Xoá mục con trước — KHÔNG dựa vào referential action ở DB (model khai onDelete: Restrict, xem
    // prisma/schema.prisma) để không phụ thuộc hành vi cascade tự động của SQL Server. Vì menu chỉ
    // sâu tối đa 2 cấp (đã validate ở assertValidParent), các mục bị xoá ở đây chắc chắn không có
    // con của riêng chúng, không cần đệ quy thêm 1 lớp nữa.
    await this.prisma.menuItem.deleteMany({ where: { parentId: id } });
    await this.prisma.menuItem.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "MenuItem", entityId: id });
  }

  /** Công khai (GET /menu, apps/web Header.tsx) — dựng cây menu: chỉ mục isActive, sắp theo
   * sortOrder, tự chèn thêm children theo Category thật khi autoCategoryChildren=true. */
  async getPublicTree(): Promise<PublicMenuItemDto[]> {
    const items = await this.prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    });

    const topLevel = items.filter((item) => item.parentId === null);
    const childrenByParentId = new Map<string, typeof items>();
    for (const item of items) {
      if (item.parentId === null) continue;
      const list = childrenByParentId.get(item.parentId) ?? [];
      list.push(item);
      childrenByParentId.set(item.parentId, list);
    }

    const needsAutoCategories = topLevel.some((item) => item.autoCategoryChildren);
    const autoCategoryEntries = needsAutoCategories ? await this.buildAutoCategoryEntries() : [];

    return topLevel.map((item) => {
      const manualChildren: PublicMenuItemDto[] = (childrenByParentId.get(item.id) ?? []).map((child) => ({
        id: child.id,
        label: child.label,
        url: child.url,
        children: []
      }));
      const children = item.autoCategoryChildren ? [...manualChildren, ...autoCategoryEntries] : manualChildren;
      return { id: item.id, label: item.label, url: item.url, children };
    });
  }

  /** Chuyên mục thật đủ điều kiện tự động liệt kê — không thuộc "Giới thiệu", chưa bị admin ẩn khỏi
   * menu qua trang Chuyên mục (Category.showInMenu — xem ghi chú trong schema.prisma), và không nằm
   * trong danh sách loại trừ cố định AUTO_CATEGORY_EXCLUDED_SLUGS. */
  private async buildAutoCategoryEntries(): Promise<PublicMenuItemDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { isAboutSection: false, showInMenu: true },
      orderBy: { sortOrder: "asc" }
    });
    return categories
      .filter((category) => !AUTO_CATEGORY_EXCLUDED_SLUGS.has(category.slug))
      .map((category) => ({
        id: `category:${category.id}`,
        label: category.name,
        url: `/tin-tuc?category=${category.slug}`,
        children: []
      }));
  }

  /** Kiểm tra parentId hợp lệ khi tạo/sửa: không tự làm cha chính mình, cha phải tồn tại và là mục
   * cấp 1 (menu chỉ sâu tối đa 2 cấp), và mục đang có con thì không thể biến thành con của mục khác
   * (tránh vô tình tạo ra cấp 3). `itemId` = null khi đang tạo mới (luôn chưa có con nên bỏ qua kiểm
   * tra cuối). `parentId` = undefined nghĩa là không đổi (bỏ qua toàn bộ hàm), null nghĩa là chuyển
   * về mục cấp 1 (luôn hợp lệ, không cần kiểm tra thêm). */
  private async assertValidParent(itemId: string | null, parentId: string | null | undefined): Promise<void> {
    if (parentId === undefined || parentId === null) return;

    if (parentId === itemId) {
      throw new BadRequestException("Không thể chọn chính mục này làm mục cha.");
    }

    const parent = await this.prisma.menuItem.findUnique({ where: { id: parentId } });
    if (!parent) {
      throw new BadRequestException("Không tìm thấy mục cha đã chọn.");
    }
    if (parent.parentId !== null) {
      throw new BadRequestException("Mục cha đã chọn là mục con — menu chỉ hỗ trợ tối đa 2 cấp.");
    }

    if (itemId) {
      const childCount = await this.prisma.menuItem.count({ where: { parentId: itemId } });
      if (childCount > 0) {
        throw new BadRequestException(
          "Mục này đang có mục con — không thể chuyển thành mục con của mục khác (menu chỉ hỗ trợ tối đa 2 cấp)."
        );
      }
    }
  }
}
