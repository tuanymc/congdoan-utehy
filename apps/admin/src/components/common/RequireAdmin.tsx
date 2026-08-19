import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useGetIdentity, useNotification } from "@refinedev/core";
import type { AuthUser } from "@congdoan/types";
import { Skeleton } from "../ui/skeleton";

/** Bọc các trang chỉ dành cho ADMIN (module Người dùng) — không phải ADMIN thì đưa về dashboard kèm thông báo. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { data: identity, isLoading } = useGetIdentity<AuthUser>();
  const { open } = useNotification();
  const navigate = useNavigate();
  const isAdmin = identity?.roles.includes("ADMIN") ?? false;

  useEffect(() => {
    if (!isLoading && identity && !isAdmin) {
      open?.({
        type: "error",
        message: "Bạn không có quyền truy cập trang này.",
        description: "Chức năng Người dùng chỉ dành cho vai trò Quản trị viên (ADMIN)."
      });
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, identity, isAdmin, navigate, open]);

  if (isLoading || !identity) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
