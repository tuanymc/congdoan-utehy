/**
 * Auth context — quản lý phiên đăng nhập đoàn viên.
 *
 * LƯU Ý BẢO MẬT: access token chỉ giữ trong state (bộ nhớ), KHÔNG lưu localStorage/sessionStorage.
 * refreshToken được lưu trong localStorage (key `congdoan_refresh_token`) để khôi phục phiên khi
 * tải lại trang. Lưu access token trong localStorage là rủi ro XSS — bản production nên chuyển
 * sang httpOnly cookie do backend set, đây là bản MVP nên tạm chấp nhận đánh đổi này ở mức
 * refreshToken (vẫn còn rủi ro thấp hơn access token vì refreshToken có thể bị thu hồi phía server).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { AuthUser, LoginResponse, TokenPair } from "@congdoan/types";
import { apiFetch, setAccessToken as setApiClientAccessToken } from "./api-client";

const REFRESH_TOKEN_STORAGE_KEY = "congdoan_refresh_token";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  /** true trong lúc app đang thử khôi phục phiên từ refreshToken lưu sẵn — dùng để tránh nháy UI. */
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistRefreshToken(refreshToken: string | null): void {
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  /** Áp dụng cặp token mới: cập nhật api-client (dùng ngay cho request tiếp theo), state, localStorage. */
  const applySession = useCallback((tokens: TokenPair, nextUser: AuthUser) => {
    setApiClientAccessToken(tokens.accessToken);
    setAccessTokenState(tokens.accessToken);
    setUser(nextUser);
    persistRefreshToken(tokens.refreshToken);
  }, []);

  const clearSession = useCallback(() => {
    setApiClientAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
    persistRefreshToken(null);
  }, []);

  // Khôi phục phiên khi tải lại trang: nếu có refreshToken lưu sẵn, thử refresh rồi lấy /auth/me.
  useEffect(() => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!storedRefreshToken) {
      setIsInitializing(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const tokens = await apiFetch<TokenPair>("/auth/refresh", {
          method: "POST",
          body: { refreshToken: storedRefreshToken }
        });
        // Gắn access token trước khi gọi /auth/me để apiFetch tự đính kèm Authorization header.
        setApiClientAccessToken(tokens.accessToken);
        const me = await apiFetch<AuthUser>("/auth/me");
        if (!cancelled) {
          applySession(tokens, me);
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Chỉ chạy một lần khi mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email, password }
      });
      const { user: loggedInUser, ...tokens } = response;
      applySession(tokens, loggedInUser);
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (storedRefreshToken) {
      try {
        await apiFetch("/auth/logout", { method: "POST", body: { refreshToken: storedRefreshToken } });
      } catch {
        // Best-effort: dù gọi API thất bại (mất mạng, token đã hết hạn...) vẫn xoá phiên ở FE.
      }
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isInitializing,
      isAuthenticated: user !== null,
      login,
      logout
    }),
    [user, accessToken, isInitializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }
  return context;
}
