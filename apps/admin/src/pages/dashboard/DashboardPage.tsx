import { useEffect, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import type { AuthUser, CategoryDto, PaginatedResult, PostListItemDto } from "@congdoan/types";
import { apiFetch } from "../../lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

interface DashboardStats {
  totalPosts: number;
  totalCategories: number;
}

export function DashboardPage() {
  const { data: identity } = useGetIdentity<AuthUser>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const [postsResult, categories] = await Promise.all([
          apiFetch<PaginatedResult<PostListItemDto>>("/admin/posts?page=1&pageSize=1"),
          apiFetch<CategoryDto[]>("/categories")
        ]);
        if (!cancelled) {
          setStats({ totalPosts: postsResult.total, totalCategories: categories.length });
        }
      } catch {
        // Lỗi (401/403/mạng) đã được báo qua toast từ onError của authProvider/apiFetch — ở đây chỉ dừng loading.
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Xin chào, {identity?.fullName ?? "bạn"}</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống quản trị website Công đoàn UTEHY.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !stats ? <Skeleton className="h-9 w-16" /> : <p className="text-3xl font-semibold">{stats.totalPosts}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số chuyên mục</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !stats ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-semibold">{stats.totalCategories}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
