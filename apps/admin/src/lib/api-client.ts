/**
 * Client fetch dùng chung cho toàn bộ trang quản trị — gắn base URL, gắn header Authorization từ
 * access token hiện có, và tự động refresh khi gặp 401 (một lần) trước khi retry request gốc.
 *
 * Ghi chú MVP: accessToken giữ trong biến module-scope (mất khi tải lại trang, phải refresh lại từ
 * refreshToken lưu trong localStorage). Production nên chuyển sang httpOnly cookie do backend set,
 * tránh lưu token nhạy cảm phía client (rủi ro bị đánh cắp qua XSS) — xem thêm README.md.
 */
import type { ApiErrorBody, TokenPair } from "@congdoan/types";

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const REFRESH_TOKEN_STORAGE_KEY = "congdoan_admin_refresh_token";

/** Biến module-scope giữ access token hiện tại — xem ghi chú MVP ở đầu file. */
let currentAccessToken: string | null = null;

/** Promise refresh đang chạy, dùng để gộp nhiều request 401 xảy ra cùng lúc thành một lần gọi /auth/refresh. */
let refreshInFlight: Promise<TokenPair> | null = null;

export function getAccessToken(): string | null {
  return currentAccessToken;
}

export function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }): void {
  currentAccessToken = tokens.accessToken;
  try {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
  } catch {
    // localStorage có thể bị chặn (chế độ duyệt web riêng tư) — bỏ qua, phiên vẫn hoạt động trong tab hiện tại.
  }
}

export function clearTokens(): void {
  currentAccessToken = null;
  try {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const SESSION_NOTICE_KEY = "congdoan_admin_session_notice";

/** Chặn nhiều request 401 cùng lúc gọi replace() lặp lại. */
let sessionRedirectStarted = false;

function isOnLoginPage(): boolean {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/login" || path.endsWith("/admin/login");
}

/**
 * Phiên đã chết: rời trang hiện tại bằng điều hướng đầy đủ, không đi qua react-router.
 * Form sửa công văn đang mở có thể chặn navigate() của Refine (cảnh báo thay đổi chưa lưu)
 * nên màn hình giữ nguyên và không báo gì. sessionStorage để trang đăng nhập hiện đúng câu thông báo.
 */
export function redirectToLogin(message?: string): void {
  if (isOnLoginPage() || sessionRedirectStarted) return;
  sessionRedirectStarted = true;
  clearTokens();
  if (message) {
    try {
      sessionStorage.setItem(SESSION_NOTICE_KEY, message);
    } catch {
      // ignore
    }
  }
  const href = import.meta.env.PROD ? "/admin/login" : "/login";
  window.location.replace(href);
}

export function readSessionNotice(): string | null {
  try {
    return sessionStorage.getItem(SESSION_NOTICE_KEY);
  } catch {
    return null;
  }
}

export function clearSessionNotice(): void {
  try {
    sessionStorage.removeItem(SESSION_NOTICE_KEY);
  } catch {
    // ignore
  }
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly details?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errorCode: string, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody | null> {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as ApiErrorBody) : null;
  } catch {
    return null;
  }
}

async function doRefresh(): Promise<TokenPair> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new ApiError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", 401, "AUTH_NO_REFRESH_TOKEN");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    const body = await parseErrorBody(response);
    throw new ApiError(
      body?.message ?? "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
      response.status,
      body?.errorCode ?? "AUTH_REFRESH_FAILED"
    );
  }

  const tokens = (await response.json()) as TokenPair;
  setTokens(tokens);
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
 * Access token chỉ nằm trong bộ nhớ tab, mất khi tải lại trang. Nếu còn refresh token thì lấy
 * access token mới TRƯỚC khi gọi API — tránh GET /auth/me không kèm token rồi nhận 401 đỏ trên
 * Network trong khi phiên vẫn còn hạn.
 */
async function ensureAccessToken(): Promise<void> {
  if (currentAccessToken) return;
  if (!getStoredRefreshToken()) {
    const message = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.";
    redirectToLogin(message);
    throw new ApiError(message, 401, "AUTH_NO_REFRESH_TOKEN");
  }
  try {
    await refreshAccessToken();
  } catch (refreshError) {
    const message =
      refreshError instanceof ApiError
        ? refreshError.message
        : "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.";
    redirectToLogin(message);
    if (refreshError instanceof ApiError) throw refreshError;
    throw new ApiError(message, 401, "AUTH_SESSION_EXPIRED");
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** Payload sẽ được JSON.stringify tự động (bỏ qua nếu không truyền). */
  body?: unknown;
  /** Bỏ qua header Authorization — dùng cho endpoint public (vd GET /categories khi chưa đăng nhập). */
  skipAuth?: boolean;
  /** Nội bộ: đánh dấu request đã retry sau khi refresh, tránh lặp refresh vô hạn. */
  _isRetry?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, skipAuth, _isRetry, headers, ...rest } = options;

  if (!skipAuth && !currentAccessToken) {
    await ensureAccessToken();
  }

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined)
  };

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (!skipAuth && currentAccessToken) {
    finalHeaders.Authorization = `Bearer ${currentAccessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    cache: "no-store",
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (response.status === 401 && !skipAuth) {
    if (_isRetry) {
      // Đã refresh và retry một lần nhưng vẫn 401 -> phiên thực sự đã hết hạn, coi như đăng xuất.
      const errorBody = await parseErrorBody(response);
      const message = errorBody?.message ?? "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.";
      redirectToLogin(message);
      throw new ApiError(message, 401, errorBody?.errorCode ?? "AUTH_SESSION_EXPIRED", errorBody?.details);
    }

    try {
      await refreshAccessToken();
    } catch (refreshError) {
      const message =
        refreshError instanceof ApiError
          ? refreshError.message
          : "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.";
      redirectToLogin(message);
      if (refreshError instanceof ApiError) {
        throw refreshError;
      }
      throw new ApiError(message, 401, "AUTH_SESSION_EXPIRED");
    }

    return apiFetch<T>(path, { ...options, _isRetry: true });
  }

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw new ApiError(
      errorBody?.message ?? "Đã có lỗi xảy ra, vui lòng thử lại sau.",
      response.status,
      errorBody?.errorCode ?? "UNKNOWN_ERROR",
      errorBody?.details
    );
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

/**
 * Tải file nhị phân (vd file đính kèm công văn) kèm header Authorization — không dùng được apiFetch()
 * vì hàm đó luôn parse JSON. Đọc tên file gốc từ header Content-Disposition do server set (xem
 * admin-official-documents.controller.ts) để khỏi phải truyền tên riêng. 401 thì thử refresh một lần;
 * nếu vẫn hết phiên thì chuyển về trang đăng nhập.
 */
export async function apiFetchBlob(path: string, _isRetry = false): Promise<{ blob: Blob; fileName: string }> {
  if (!currentAccessToken) {
    await ensureAccessToken();
  }
  const headers: Record<string, string> = {};
  if (currentAccessToken) {
    headers.Authorization = `Bearer ${currentAccessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { headers, cache: "no-store" });

  if (response.status === 401) {
    if (_isRetry) {
      redirectToLogin("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
    } else {
      try {
        await refreshAccessToken();
        return apiFetchBlob(path, true);
      } catch (refreshError) {
        const message =
          refreshError instanceof ApiError
            ? refreshError.message
            : "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.";
        redirectToLogin(message);
      }
    }
  }

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw new ApiError(
      errorBody?.message ?? "Không tải được file, vui lòng thử lại sau.",
      response.status,
      errorBody?.errorCode ?? "UNKNOWN_ERROR",
      errorBody?.details
    );
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const fileName = match?.[1] ? decodeURIComponent(match[1]) : "tep-dinh-kem";

  const blob = await response.blob();
  return { blob, fileName };
}

/**
 * Upload multipart/form-data (vd chọn 1 hoặc nhiều file đính kèm công văn/biểu mẫu) — không dùng được
 * apiFetch() vì hàm đó luôn JSON.stringify body và set Content-Type: application/json, trong khi
 * FormData cần trình duyệt tự set Content-Type kèm boundary. Có tự refresh token khi 401 giống
 * apiFetch() (khác apiFetchBlob) vì upload là thao tác ghi dữ liệu, đáng để retry hơn là báo lỗi ngay.
 */
export async function apiFetchUpload<T>(path: string, formData: FormData, _isRetry = false): Promise<T> {
  if (!currentAccessToken) {
    await ensureAccessToken();
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  if (currentAccessToken) {
    headers.Authorization = `Bearer ${currentAccessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { method: "POST", headers, body: formData, cache: "no-store" });

  if (response.status === 401) {
    if (_isRetry) {
      const errorBody = await parseErrorBody(response);
      const message = errorBody?.message ?? "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.";
      redirectToLogin(message);
      throw new ApiError(message, 401, errorBody?.errorCode ?? "AUTH_SESSION_EXPIRED", errorBody?.details);
    }
    try {
      await refreshAccessToken();
    } catch (refreshError) {
      const message =
        refreshError instanceof ApiError
          ? refreshError.message
          : "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.";
      redirectToLogin(message);
      if (refreshError instanceof ApiError) throw refreshError;
      throw new ApiError(message, 401, "AUTH_SESSION_EXPIRED");
    }
    return apiFetchUpload<T>(path, formData, true);
  }

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw new ApiError(
      errorBody?.message ?? "Tải file lên thất bại, vui lòng thử lại sau.",
      response.status,
      errorBody?.errorCode ?? "UNKNOWN_ERROR",
      errorBody?.details
    );
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
