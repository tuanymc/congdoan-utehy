/**
 * Kiểu dữ liệu dùng chung cho toàn bộ API (phân trang, response bao bọc, lỗi chuẩn hoá).
 * apps/api trả về đúng các shape này; apps/web và apps/admin import trực tiếp để có type-safety
 * xuyên suốt FE <-> BE mà không cần định nghĩa lại.
 */

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiErrorBody {
  statusCode: number;
  /** Mã lỗi ổn định để FE xử lý logic (vd: "AUTH_INVALID_CREDENTIALS"). */
  errorCode: string;
  /** Thông báo tiếng Việt hiển thị trực tiếp cho người dùng cuối. */
  message: string;
  /** Chi tiết lỗi validate theo từng field (nếu có). */
  details?: Record<string, string[]>;
  timestamp: string;
  path: string;
}

/** Bốn nhóm vai trò mặc định của hệ thống — xem mục 6 bản thiết kế. */
export const SYSTEM_ROLES = {
  ADMIN: "ADMIN",
  UNION_CLERK: "UNION_CLERK",
  DEPARTMENT_OFFICER: "DEPARTMENT_OFFICER",
  MEMBER: "MEMBER"
} as const;

export type SystemRoleCode = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/** Các thao tác chuẩn cho RBAC theo từng module (xem checklist mục 6 CURSOR_PROMPT). */
export type PermissionAction = "view" | "create" | "update" | "delete" | "approve";
