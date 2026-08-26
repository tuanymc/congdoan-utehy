import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DIGITAL_HANDBOOK_CATEGORY_SLUG, type PaginatedResult, type PostListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/PostCard";

const PAGE_SIZE = 9;

/** "Cẩm nang - Kiến thức số" — tiểu mục Tiện ích số. Tái dùng Post + chuyên mục
 * cam-nang-kien-thuc-so (ẩn khỏi dropdown Tin hoạt động, không lẫn vào /tin-tuc). Đăng bài trong
 * admin: Bài viết → chọn chuyên mục "Cẩm nang - Kiến thức số". */
export function DigitalHandbookPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [result, setResult] = useState<PaginatedResult<PostListItemDto> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setResult(null);

    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      categorySlug: DIGITAL_HANDBOOK_CATEGORY_SLUG
    });

    apiFetch<PaginatedResult<PostListItemDto>>(`/posts?${query.toString()}`)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không thể tải danh sách bài viết.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        <Link to="/tien-ich-so-cong-doan" className="hover:text-primary">
          Tiện ích số
        </Link>
        {" / "}
        Cẩm nang - Kiến thức số
      </p>
      <h1 className="mt-2 text-3xl font-bold">Cẩm nang - Kiến thức số</h1>
      <p className="mt-2 text-muted-foreground">
        Giới thiệu, hướng dẫn và kiến thức chuyển đổi số dành cho đoàn viên Công đoàn Trường Đại học
        Sư phạm Kỹ thuật Hưng Yên.
      </p>

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
          <p className="text-sm text-muted-foreground">Chưa có bài viết nào trong mục này.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {result.totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
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
