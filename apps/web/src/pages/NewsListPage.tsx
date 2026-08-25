import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import type { CategoryDto, PaginatedResult, PostListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/PostCard";
import { cn } from "@/components/ui/utils";

const PAGE_SIZE = 9;
/** Chuyên mục này đã chuyển sang Kho biểu mẫu — không còn lọc trên trang tin tức. */
const FORMS_MOVED_SLUG = "van-ban";

export function NewsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const categorySlug = searchParams.get("category") ?? "";

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [result, setResult] = useState<PaginatedResult<PostListItemDto> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<CategoryDto[]>("/categories")
      // "?? []" phòng apiFetch trả về null — categories.length bên dưới không tự chống null.
      .then((data) => setCategories(data ?? []))
      .catch(() => {
        // Không chặn trang khi lỗi tải chuyên mục — chỉ ẩn bộ lọc.
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setResult(null);

    const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (categorySlug) query.set("categorySlug", categorySlug);

    apiFetch<PaginatedResult<PostListItemDto>>(`/posts?${query.toString()}`)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không thể tải danh sách tin tức.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, categorySlug]);

  function selectCategory(nextSlug: string) {
    const next = new URLSearchParams(searchParams);
    if (nextSlug) {
      next.set("category", nextSlug);
    } else {
      next.delete("category");
    }
    next.delete("page");
    setSearchParams(next);
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const newsCategories = categories.filter((category) => category.slug !== FORMS_MOVED_SLUG);

  if (categorySlug === FORMS_MOVED_SLUG) {
    return <Navigate to="/tien-ich-so-cong-doan/bieu-mau" replace />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Tin tức Công đoàn</h1>
      <p className="mt-2 text-muted-foreground">
        Thông báo, hoạt động phong trào và tin tức của Công đoàn Trường Đại học Sư phạm Kỹ thuật
        Hưng Yên.
      </p>

      {newsCategories.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectCategory("")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              categorySlug === ""
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent"
            )}
          >
            Tất cả
          </button>
          {newsCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => selectCategory(category.slug)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                categorySlug === category.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-accent"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : result === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <Skeleton key={index} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : result.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có tin tức nào {categorySlug ? "trong chuyên mục này" : ""}.
          </p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {result.totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {result.page} / {result.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= result.totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Sau
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
