import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useGetIdentity, useNotification } from "@refinedev/core";
import type { AuthUser } from "@congdoan/types";
import { Skeleton } from "../ui/skeleton";

/**
 * Bọc các trang module Công văn (Loại công văn / Công văn) — chỉ ADMIN và UNION_CLERK ("Văn thư công
 * đoàn") mới có quyền "document:*"/"documenttype:*" theo prisma/seed.ts. AuthUser (xem @congdoan/types)
 * chỉ có field `roles`, không có `permissions` chi tiết ở phía FE, nên chỉ kiểm tra theo 2 role cố
 * định này — API vẫn là nơi kiểm tra permission thật sự (PermissionsGuard), đây chỉ là lớp UX chặn
 * sớm để tránh hiện trang rồi mới báo lỗi 403.
 */
export function RequireDocumentAccess({ children }: { children: ReactNode }) {
  const { data: identity, isLoading } = useGetIdentity<AuthUser>();
  const { open } = useNotification();
  const navigate = useNavigate();
  const hasAccess = identity?.roles.some((role) => role === "ADMIN" || role === "UNION_CLERK") ?? false;

  useEffect(() => {
    if (!isLoading && identity && !hasAccess) {
      open?.({
        type: "error",
        message: "Bạn không có quyền truy cập trang này.",
        description: "Chức năng Công văn chỉ dành cho vai trò Quản trị viên hoặc Văn thư công đoàn."
      });
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, identity, hasAccess, navigate, open]);

  if (isLoading || !identity) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
