/**
 * Domain MenuItem — menu điều hướng chính của trang công khai (Header.tsx), quản lý được qua trang
 * quản trị thay vì hard-code trong code như trước. Tối đa 2 cấp (mục cấp 1 + mục con dropdown),
 * khớp đúng cấu trúc menu web cũ (congdoan.utehy.edu.vn): "Trang chủ", "Giới thiệu ▾", "Tin hoạt
 * động ▾", "Văn bản ▾", "Công đoàn viên", "Ý kiến Công đoàn viên", "Văn hóa đọc".
 */

/** Dùng cho trang quản trị — 1 bản ghi phẳng, chưa dựng cây. */
export interface MenuItemDto {
  id: string;
  label: string;
  /** Đường dẫn khi bấm vào mục — vd "/gioi-thieu", "/tin-tuc?category=van-hoa-doc", "/gioi-thieu#lien-he". */
  url: string;
  sortOrder: number;
  isActive: boolean;
  /** Chỉ có ý nghĩa khi parentId=null (mục cấp 1) — bật thì dropdown mục này sẽ tự động liệt kê
   * thêm các Chuyên mục thật (Category) chưa gắn ở nơi khác trong menu, để mục "Tin hoạt động" tự
   * cập nhật khi admin thêm chuyên mục mới mà không cần sửa menu thủ công. Xem menu-items.service.ts. */
  autoCategoryChildren: boolean;
  /** null = mục cấp 1. Khác null = mục con, trỏ tới id của 1 mục cấp 1 (không hỗ trợ quá 2 cấp). */
  parentId: string | null;
}

/** Dùng cho trang công khai (GET /menu) — cây đã dựng sẵn, chỉ gồm mục isActive, đã sắp theo
 * sortOrder, đã tự động chèn thêm children theo Category khi autoCategoryChildren=true. */
export interface PublicMenuItemDto {
  id: string;
  label: string;
  url: string;
  children: PublicMenuItemDto[];
}

export interface CreateMenuItemRequest {
  label: string;
  url: string;
  sortOrder?: number;
  isActive?: boolean;
  autoCategoryChildren?: boolean;
  parentId?: string | null;
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {}
