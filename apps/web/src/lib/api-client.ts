/**
 * Client HTTP mỏng bọc quanh `fetch` để gọi apps/api.
 * - Tự gắn `VITE_API_BASE_URL` vào trước path.
 * - Tự gắn header Authorization nếu đang có access token (do auth-context.tsx set qua
 *   `setAccessToken`).
 * - Khi 401: tự gọi /auth/refresh (một lần, gộp các request song song) rồi retry — bắt buộc vì
 *   access token chỉ sống 15 phút trong khi bài thi pháp luật mặc định 30 phút.
 * - Khi response lỗi, parse theo `ApiErrorBody` và ném `ApiError` với message tiếng Việt
 *   sẵn có từ backend để hiển thị trực tiếp cho người dùng.
 */
import type { ApiErrorBody, TokenPair } from "@congdoan/types";

/** Export để các trang cần dựng URL trực tiếp (vd link tải file đính kèm <a href>, không qua apiFetch
 * vì đó là điều hướng trình duyệt tải file chứ không phải gọi API lấy JSON). */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const REFRESH_TOKEN_STORAGE_KEY = "congdoan_refresh_token";

const FALLBACK_ERROR_MESSAGE = "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.";
const SESSION_EXPIRED_MESSAGE = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.";

/** Access token hiện tại, giữ trong bộ nhớ (không lưu localStorage) — xem auth-context.tsx. */
let currentAccessToken: string | null = null;

/** Gộp nhiều 401 cùng lúc thành một lần /auth/refresh (rotation: lần 2 dùng token cũ sẽ 401). */
let refreshInFlight: Promise<TokenPair> | null = null;

/** Được auth-context.tsx gọi mỗi khi access token thay đổi (đăng nhập, refresh, đăng xuất). */
export function setAccessToken(token: string | null): void {
  currentAccessToken = token;
}

export function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistRefreshToken(refreshToken: string | null): void {
  try {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // localStorage có thể bị chặn (duyệt web riêng tư).
  }
}

export function applyTokenPair(tokens: TokenPair): void {
  setAccessToken(tokens.accessToken);
  persistRefreshToken(tokens.refreshToken);
}

export function clearSessionTokens(): void {
  setAccessToken(null);
  persistRefreshToken(null);
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
  /** Không gắn Bearer và không tự refresh — dùng cho login/refresh/logout. */
  skipAuth?: boolean;
  /** Nội bộ: đã retry một lần sau refresh, tránh vòng lặp 401. */
  _isRetry?: boolean;
}

function isAuthHandshakePath(path: string): boolean {
  return path.startsWith("/auth/login") || path.startsWith("/auth/refresh") || path.startsWith("/auth/logout");
}

function toApiError(statusCode: number, errorBody: Partial<ApiErrorBody> | null, path: string): ApiError {
  const rawMessage = errorBody?.message ?? FALLBACK_ERROR_MESSAGE;
  const message =
    statusCode === 401 && (rawMessage === "Unauthorized" || rawMessage === FALLBACK_ERROR_MESSAGE)
      ? SESSION_EXPIRED_MESSAGE
      : rawMessage;
  return new ApiError({
    statusCode: errorBody?.statusCode ?? statusCode,
    errorCode: errorBody?.errorCode ?? (statusCode === 401 ? "UNAUTHORIZED" : "UNKNOWN_ERROR"),
    message,
    details: errorBody?.details,
    timestamp: errorBody?.timestamp ?? new Date().toISOString(),
    path: errorBody?.path ?? path
  });
}

async function doRefresh(): Promise<TokenPair> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new ApiError({
      statusCode: 401,
      errorCode: "AUTH_NO_REFRESH_TOKEN",
      message: SESSION_EXPIRED_MESSAGE,
      timestamp: new Date().toISOString(),
      path: "/auth/refresh"
    });
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

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
    throw toApiError(response.status, payload as Partial<ApiErrorBody> | null, "/auth/refresh");
  }

  const tokens = payload as TokenPair;
  if (!tokens?.accessToken || !tokens.refreshToken) {
    throw new ApiError({
      statusCode: 401,
      errorCode: "AUTH_REFRESH_FAILED",
      message: SESSION_EXPIRED_MESSAGE,
      timestamp: new Date().toISOString(),
      path: "/auth/refresh"
    });
  }

  applyTokenPair(tokens);
  return tokens;
}

function refreshAccessToken(): Promise<TokenPair> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * Gọi apps/api và trả về dữ liệu JSON đã parse (kiểu T).
 * Ném `ApiError` (message tiếng Việt) khi response không ok, hoặc `Error` thường khi mất kết nối.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers: headersInit, skipAuth, _isRetry, ...rest } = options;
  const headers = new Headers(headersInit);

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }
  if (!skipAuth && currentAccessToken) {
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

  if (response.status === 401 && !skipAuth && !_isRetry && !isAuthHandshakePath(path) && getStoredRefreshToken()) {
    try {
      await refreshAccessToken();
    } catch (refreshError) {
      clearSessionTokens();
      if (refreshError instanceof ApiError) throw refreshError;
      throw new ApiError({
        statusCode: 401,
        errorCode: "AUTH_SESSION_EXPIRED",
        message: SESSION_EXPIRED_MESSAGE,
        timestamp: new Date().toISOString(),
        path
      });
    }
    return apiFetch<T>(path, { ...options, _isRetry: true });
  }

  const method = ((rest.method as string | undefined) ?? "GET").toUpperCase();
  const isMutating = method !== "GET" && method !== "HEAD";

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
    throw toApiError(response.status, payload as Partial<ApiErrorBody> | null, path);
  }

  // Body rỗng với 2xx: NestJS `void` mặc định 201 không serialize JSON; IIS ARR đôi khi đổi 204 thành
  // 200 Content-Length=0. Gửi khảo sát production từng báo lỗi giả dù đã lưu. GET 200 rỗng vẫn là lỗi
  // (API danh sách/chi tiết luôn trả JSON).
  if (payload === null && (response.status === 201 || (isMutating && response.status === 200))) {
    return undefined as T;
  }

  // GET/HEAD 200 mà thiếu JSON — ném lỗi để .catch() bắt, tránh crash "reading 'items' of null".
  if (payload === null) {
    throw new Error(
      `Máy chủ trả về dữ liệu không hợp lệ cho ${path} (response ok nhưng thiếu nội dung JSON).`
    );
  }

  return payload as T;
}
