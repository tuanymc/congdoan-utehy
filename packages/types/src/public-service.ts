/**
 * Domain "Dịch vụ công" (Tiện ích số, Phase 4e) — xem chú thích domain block ở đầu 4 model
 * PublicServiceProcedure/PublicServiceLink/PublicServiceSupportRequest/PublicServiceNotice trong
 * prisma/schema.prisma cho đầy đủ bối cảnh + các quyết định thiết kế đã chốt.
 */

// ----------------------------------------------------------------------------
// Nhóm 1 + 2: PublicServiceProcedure (Tra cứu nhanh + Hướng dẫn từng bước)
// ----------------------------------------------------------------------------

/** Đúng 9 nhóm thủ tục người quản trị đã liệt kê (8 nhóm cụ thể + 1 nhóm "Khác"). */
export const PUBLIC_SERVICE_PROCEDURE_CATEGORIES = [
  "CAN_CUOC",
  "CU_TRU",
  "HO_TICH",
  "BHXH_BHYT",
  "THUE_TNCN",
  "LY_LICH_TU_PHAP",
  "GPLX",
  "DANG_KY_PHUONG_TIEN",
  "KHAC"
] as const;

export type PublicServiceProcedureCategory = (typeof PUBLIC_SERVICE_PROCEDURE_CATEGORIES)[number];

export const PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS: Record<PublicServiceProcedureCategory, string> = {
  CAN_CUOC: "Cấp/đổi căn cước",
  CU_TRU: "Cư trú, xác nhận thông tin cư trú",
  HO_TICH: "Hộ tịch",
  BHXH_BHYT: "BHXH, BHYT",
  THUE_TNCN: "Thuế thu nhập cá nhân",
  LY_LICH_TU_PHAP: "Lý lịch tư pháp",
  GPLX: "Giấy phép lái xe",
  DANG_KY_PHUONG_TIEN: "Đăng ký phương tiện",
  KHAC: "Thủ tục khác liên quan viên chức, gia đình"
};

/** Bản đầy đủ dùng ở trang quản trị — bao gồm isActive (trạng thái nháp/đã duyệt). */
export interface PublicServiceProcedureDto {
  id: string;
  slug: string;
  title: string;
  category: PublicServiceProcedureCategory;
  summary: string | null;
  conditions: string | null;
  requiredDocuments: string | null;
  whereToApply: string | null;
  steps: string | null;
  fee: string | null;
  processingTime: string | null;
  resultDelivery: string | null;
  commonMistakes: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicServiceProcedureRequest {
  slug: string;
  title: string;
  category: PublicServiceProcedureCategory;
  summary?: string;
  conditions?: string;
  requiredDocuments?: string;
  whereToApply?: string;
  steps?: string;
  fee?: string;
  processingTime?: string;
  resultDelivery?: string;
  commonMistakes?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePublicServiceProcedureRequest extends Partial<CreatePublicServiceProcedureRequest> {}

/** Bản rút gọn cho lưới "Tra cứu nhanh" công khai — CỐ Ý bỏ 8 trường hướng dẫn chi tiết. */
export interface PublicServiceProcedureListItemDto {
  id: string;
  slug: string;
  title: string;
  category: PublicServiceProcedureCategory;
  summary: string | null;
}

/** Bản chi tiết công khai (trang /dich-vu-cong/thu-tuc/:slug) — CỐ Ý bỏ isActive (đã lọc isActive=true
 * khi trả về, không cần lộ trạng thái nội bộ). */
export interface PublicServiceProcedureDetailDto {
  id: string;
  slug: string;
  title: string;
  category: PublicServiceProcedureCategory;
  summary: string | null;
  conditions: string | null;
  requiredDocuments: string | null;
  whereToApply: string | null;
  steps: string | null;
  fee: string | null;
  processingTime: string | null;
  resultDelivery: string | null;
  commonMistakes: string | null;
}

// ----------------------------------------------------------------------------
// Nhóm 3: PublicServiceLink (Kho biểu mẫu và đường dẫn chính thống)
// ----------------------------------------------------------------------------

export interface PublicServiceLinkDto {
  id: string;
  title: string;
  url: string;
  description: string | null;
  group: string | null;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicServiceLinkRequest {
  title: string;
  url: string;
  description?: string;
  group?: string;
  logoUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdatePublicServiceLinkRequest extends Partial<CreatePublicServiceLinkRequest> {}

/** Bản công khai — CỐ Ý bỏ isActive (đã lọc sẵn). QR code sinh ở FE trực tiếp từ `url`, không có field
 * ảnh QR riêng (xem ghi chú PublicServiceLink trong schema.prisma). */
export interface PublicServiceLinkPublicDto {
  id: string;
  title: string;
  url: string;
  description: string | null;
  group: string | null;
  logoUrl: string | null;
}

// ----------------------------------------------------------------------------
// Nhóm 4: PublicServiceSupportRequest ("Công đoàn hỗ trợ tôi")
// ----------------------------------------------------------------------------

export const PUBLIC_SERVICE_SUPPORT_REQUEST_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export type PublicServiceSupportRequestStatus = (typeof PUBLIC_SERVICE_SUPPORT_REQUEST_STATUSES)[number];

export const PUBLIC_SERVICE_SUPPORT_REQUEST_STATUS_LABELS: Record<PublicServiceSupportRequestStatus, string> = {
  NEW: "Mới",
  IN_PROGRESS: "Đang xử lý",
  RESOLVED: "Đã xử lý",
  CLOSED: "Đã đóng"
};

/** Bản dùng ở trang quản trị (triage) — procedureTitle/assignedToName đã resolve sẵn để FE không phải
 * gọi thêm API tra tên. */
export interface PublicServiceSupportRequestDto {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  procedureId: string | null;
  procedureTitle: string | null;
  procedureOther: string | null;
  stuckStep: string | null;
  description: string | null;
  status: PublicServiceSupportRequestStatus;
  assignedToUserId: string | null;
  assignedToName: string | null;
  staffNote: string | null;
  createdAt: string;
  updatedAt: string;
}

/** fullName bắt buộc; phone/email optional ở tầng type nhưng service validate PHẢI có ít nhất 1 trong 2
 * (xem PublicServiceSupportRequestsService.submit — không dùng CHECK constraint CSDL, giữ đơn giản). */
export interface CreatePublicServiceSupportRequestRequest {
  fullName: string;
  phone?: string;
  email?: string;
  procedureId?: string;
  procedureOther?: string;
  stuckStep?: string;
  description?: string;
}

/** Dùng ở trang quản trị để triage — chỉ đổi được status/assignedToUserId/staffNote, KHÔNG sửa lại
 * thông tin người gửi (đó là dữ liệu người dùng tự khai, giữ nguyên làm bằng chứng gốc). */
export interface UpdatePublicServiceSupportRequestRequest {
  status?: PublicServiceSupportRequestStatus;
  /** null = bỏ phân công. */
  assignedToUserId?: string | null;
  staffNote?: string;
}

// ----------------------------------------------------------------------------
// Nhóm 5: PublicServiceNotice (Cảnh báo và nhắc việc)
// ----------------------------------------------------------------------------

export const PUBLIC_SERVICE_NOTICE_CATEGORIES = [
  "GPLX_EXPIRY",
  "INSURANCE_POLICY",
  "PERSONAL_INCOME_TAX",
  "PROCEDURE_DEADLINE",
  "NEW_SERVICE",
  "OTHER"
] as const;
export type PublicServiceNoticeCategory = (typeof PUBLIC_SERVICE_NOTICE_CATEGORIES)[number];

export const PUBLIC_SERVICE_NOTICE_CATEGORY_LABELS: Record<PublicServiceNoticeCategory, string> = {
  GPLX_EXPIRY: "Sắp hết hạn giấy phép lái xe",
  INSURANCE_POLICY: "Thay đổi chính sách BHXH/BHYT",
  PERSONAL_INCOME_TAX: "Quyết toán thuế thu nhập cá nhân",
  PROCEDURE_DEADLINE: "Thời hạn thực hiện thủ tục",
  NEW_SERVICE: "Dịch vụ công trực tuyến mới",
  OTHER: "Khác"
};

export interface PublicServiceNoticeDto {
  id: string;
  title: string;
  content: string;
  category: PublicServiceNoticeCategory | null;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicServiceNoticeRequest {
  title: string;
  content: string;
  category?: PublicServiceNoticeCategory;
  isPinned?: boolean;
  isActive?: boolean;
}

export interface UpdatePublicServiceNoticeRequest extends Partial<CreatePublicServiceNoticeRequest> {}

/** Bản công khai — CỐ Ý bỏ isActive (đã lọc sẵn isActive=true). */
export interface PublicServiceNoticePublicDto {
  id: string;
  title: string;
  content: string;
  category: PublicServiceNoticeCategory | null;
  isPinned: boolean;
  createdAt: string;
}
