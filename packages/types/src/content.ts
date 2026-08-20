/**
 * Domain Content — mô hình "Bài viết + Chuyên mục" dùng chung thay cho 12 bảng tin tức rời rạc
 * của hệ thống cũ (xem mục 5.1 CURSOR_PROMPT_Website_CongDoan_UTEHY.md). Đây là module mẫu đầu
 * tiên triển khai đầy đủ end-to-end (API + admin + web) làm khuôn cho các module còn lại.
 */

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CategoryDto {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  /** true nếu chuyên mục thuộc nhóm "Giới thiệu" ở web cũ — dùng để apps/web gom bài viết vào trang
   * Giới thiệu thay vì phải hard-code nội dung tĩnh. Xem Category.isAboutSection trong schema.prisma. */
  isAboutSection: boolean;
  /** false = ẩn mục menu tự động trỏ tới chuyên mục này khỏi dropdown "Tin hoạt động" — KHÔNG ẩn bài
   * viết khỏi trang /tin-tuc. Xem Category.showInMenu trong schema.prisma. */
  showInMenu: boolean;
}

export interface PostListItemDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  status: PostStatus;
  category: CategoryDto;
  publishedAt: string | null;
  createdAt: string;
}

export interface PostDetailDto extends PostListItemDto {
  content: string;
  authorFullName: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  categoryId: string;
  coverImageUrl?: string;
  status?: PostStatus;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isAboutSection?: boolean;
  showInMenu?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}
