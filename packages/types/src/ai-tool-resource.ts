/** "Kho công cụ AI" (Tiện ích số, Phase 4c) — thư mục công cụ AI được tuyển chọn, không phải chatbot
 * thật. Xem AiToolResource trong prisma/schema.prisma. */
export interface AiToolResourceDto {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string | null;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAiToolResourceRequest {
  name: string;
  description?: string;
  url: string;
  category?: string;
  logoUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateAiToolResourceRequest extends Partial<CreateAiToolResourceRequest> {}

/** Dữ liệu trả về ở trang công khai (yêu cầu đăng nhập) — chỉ các field cần hiển thị card. */
export interface PublicAiToolResourceDto {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string | null;
  logoUrl: string | null;
}
