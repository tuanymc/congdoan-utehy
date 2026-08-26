/**
 * Client HTTP mỏng bọc quanh `fetch` để gọi apps/api.
 * - Tự gắn `VITE_API_BASE_URL` vào trước path.
 * - Tự gắn header Authorization nếu đang có access token (do auth-context.tsx set qua
 *   `setAccessToken`).
 * - Khi response lỗi, parse theo `ApiErrorBody` và ném `ApiError` với message tiếng Việt
 *   sẵn có từ backend để hiển thị trực tiếp cho người dùng.
 */
import type { ApiErrorBody } from "@congdoan/types";

/** Export để các trang cần dựng URL trực tiếp (vd link tải file đính kèm <a href>, không qua apiFetch
 * vì đó là điều hướng trình duyệt tải file chứ không phải gọi API lấy JSON). */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const FALLBACK_ERROR_MESSAGE = "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.";

/** Access token hiện tại, giữ trong bộ nhớ (không lưu localStorage) — xem auth-context.tsx. */
let currentAccessToken: string | null = null;

/** Được auth-context.tsx gọi mỗi khi access token thay đổi (đăng nhập, refresh, đăng xuất). */
export function setAccessToken(token: string | null): void {
  currentAccessToken = token;
}

/** Lỗi API chuẩn hoá — `message` luôn là tiếng Việt, có thể hiển thị trực tiếp cho người dùng. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly details?: Record<string, string[]>;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.errorCode = body.errorCode;
    this.details = body.details;
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** Object sẽ được JSON.stringify tự động và gắn Content-Type: application/json. */
  body?: unknown;
}

/**
 * Gọi apps/api và trả về dữ liệu JSON đã parse (kiểu T).
 * Ném `ApiError` (message tiếng Việt) khi response không ok, hoặc `Error` thường khi mất kết nối.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers: headersInit, ...rest } = options;
  const headers = new Headers(headersInit);

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }
  if (currentAccessToken) {
    headers.set("Authorization", `Bearer ${currentAccessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers,
      body: requestBody
    });
  } catch {
    throw new Error(FALLBACK_ERROR_MESSAGE);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const rawText = await response.text();
  let payload: unknown = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorBody = payload as Partial<ApiErrorBody> | null;
    throw new ApiError({
      statusCode: errorBody?.statusCode ?? response.status,
      errorCode: errorBody?.errorCode ?? "UNKNOWN_ERROR",
      message: errorBody?.message ?? FALLBACK_ERROR_MESSAGE,
      details: errorBody?.details,
      timestamp: errorBody?.timestamp ?? new Date().toISOString(),
      path: errorBody?.path ?? path
    });
  }

  // POST tạo bản ghi (vd gửi khảo sát) hay trả 201 + body rỗng — NestJS void không serialize JSON.
  // Trước đây nhánh dưới ném Error thường, SurveyDetailPage hiện "Không thể gửi câu trả lời lúc này"
  // dù server đã lưu thành công.
  if (payload === null && response.status === 201) {
    return undefined as T;
  }

  // response.ok=true nhưng body rỗng/không parse được JSON hợp lệ là bất thường — API luôn trả JSON
  // thật cho response 200 (204 đã xử lý riêng ở trên), không bao giờ chủ đích trả body rỗng. Từng gây
  // lỗi thật: các trang gọi .then((data) => data.items/.length) không ngờ nhận "null" nên crash trắng
  // trang (vd "Cannot read properties of null (reading 'items')") thay vì rơi vào .catch() như mong
  // muốn. Ném lỗi rõ ràng ở đây để mọi nơi gọi apiFetch đều xử lý qua .catch() sẵn có, thay vì phải tự
  // đoán "có thể null" ở từng nơi gọi.
  if (payload === null) {
    throw new Error(
      `Máy chủ trả về dữ liệu không hợp lệ cho ${path} (response ok nhưng thiếu nội dung JSON).`
    );
  }

  return payload as T;
}
