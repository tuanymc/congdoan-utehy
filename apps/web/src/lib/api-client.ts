/**
 * Client HTTP mỏng bọc quanh `fetch` để gọi apps/api.
 * - Tự gắn `VITE_API_BASE_URL` vào trước path.
 * - Tự gắn header Authorization nếu đang có access token (do auth-context.tsx set qua
 *   `setAccessToken`).
 * - Khi response lỗi, parse theo `ApiErrorBody` và ném `ApiError` với message tiếng Việt
 *   sẵn có từ backend để hiển thị trực tiếp cho người dùng.
 */
import type { ApiErrorBody } from "@congdoan/types";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

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

  return payload as T;
}
