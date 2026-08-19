/**
 * AuthProvider cho @refinedev/core, dựng trên api-client.ts.
 *
 * Ghi chú MVP: identity người dùng hiện tại (currentUser) cũng giữ trong biến module-scope thay vì
 * React state, vì authProvider là một plain object độc lập với cây component — Refine tự cache lại
 * kết quả getIdentity()/check() qua react-query nên UI vẫn re-render đúng khi identity thay đổi.
 * accessToken/refreshToken được quản lý trong lib/api-client.ts (xem ghi chú MVP ở đó về việc
 * production nên chuyển sang httpOnly cookie thay vì localStorage).
 */
import type { AuthProvider } from "@refinedev/core";
import type { AuthUser, LoginResponse } from "@congdoan/types";
import { ApiError, apiFetch, clearTokens, getAccessToken, getStoredRefreshToken, setTokens } from "../lib/api-client";

let currentUser: AuthUser | null = null;

export interface LoginVariables {
  email: string;
  password: string;
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }: LoginVariables) => {
    try {
      const response = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
        skipAuth: true
      });
      setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
      currentUser = response.user;
      return { success: true, redirectTo: "/dashboard" };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Đăng nhập thất bại, vui lòng thử lại.";
      return {
        success: false,
        error: { name: "Đăng nhập thất bại", message }
      };
    }
  },

  logout: async () => {
    const refreshToken = getStoredRefreshToken();
    currentUser = null;
    clearTokens();
    if (refreshToken) {
      try {
        await apiFetch("/auth/logout", { method: "POST", body: { refreshToken }, skipAuth: true });
      } catch {
        // Token phía client đã bị xoá — coi như đăng xuất thành công dù request tới server có lỗi.
      }
    }
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    if (!getAccessToken() && !getStoredRefreshToken()) {
      return { authenticated: false, redirectTo: "/login" };
    }
    try {
      // Nếu accessToken đã mất (tải lại trang) nhưng còn refreshToken, apiFetch sẽ tự refresh khi
      // nhận 401 từ request này — nhờ vậy phiên đăng nhập được khôi phục mà không cần code riêng.
      currentUser = await apiFetch<AuthUser>("/auth/me");
      return { authenticated: true };
    } catch {
      currentUser = null;
      clearTokens();
      return { authenticated: false, redirectTo: "/login" };
    }
  },

  onError: async (error: unknown) => {
    const statusCode = error instanceof ApiError ? error.statusCode : undefined;
    if (statusCode === 401) {
      currentUser = null;
      clearTokens();
      return { logout: true, redirectTo: "/login", error: error as Error };
    }
    if (statusCode === 403) {
      return { error: error as Error };
    }
    return {};
  },

  getIdentity: async () => {
    if (currentUser) {
      return currentUser;
    }
    try {
      currentUser = await apiFetch<AuthUser>("/auth/me");
      return currentUser;
    } catch {
      return null;
    }
  }
};

/** Truy cập nhanh identity đã cache mà không cần đợi hook — dùng ở nơi không thể dùng useGetIdentity. */
export function getCachedCurrentUser(): AuthUser | null {
  return currentUser;
}
