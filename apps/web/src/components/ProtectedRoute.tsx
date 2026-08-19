import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

/**
 * Bọc quanh các trang yêu cầu đăng nhập (vd /cong-doan-vien).
 * Trong lúc auth-context còn đang khôi phục phiên (isInitializing) thì chưa vội điều hướng,
 * tránh đá người dùng đã đăng nhập về trang đăng nhập chỉ vì chưa refresh xong token.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Đang tải phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
