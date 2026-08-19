import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { PaginatedResult, PostListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/PostCard";
import { Newspaper, Info, Phone, Wallet } from "lucide-react";

const SHORTCUTS = [
  {
    to: "/tin-tuc",
    icon: Newspaper,
    title: "Tin tức",
    description: "Hoạt động, thông báo và phong trào thi đua của Công đoàn trường."
  },
  {
    to: "/gioi-thieu",
    icon: Info,
    title: "Giới thiệu",
    description: "Chức năng, nhiệm vụ và cơ cấu tổ chức của Công đoàn UTEHY."
  },
  {
    to: "/lien-he",
    icon: Phone,
    title: "Liên hệ",
    description: "Thông tin liên hệ Văn phòng Công đoàn trường."
  },
  {
    to: "/cong-doan-vien",
    icon: Wallet,
    title: "Tiện ích số Công đoàn",
    description: "Ví đoàn phí, biểu mẫu điện tử... — sắp ra mắt.",
    badge: "Sắp ra mắt"
  }
] as const;

export function HomePage() {
  const [posts, setPosts] = useState<PostListItemDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    apiFetch<PaginatedResult<PostListItemDto>>("/posts?pageSize=6")
      .then((result) => {
        if (!cancelled) setPosts(result.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không thể tải tin tức.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* Banner giới thiệu */}
      <section className="bg-gradient-to-br from-primary to-[#78171b] text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
            Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold sm:text-4xl">
            Đoàn kết – Trách nhiệm – Vì quyền lợi hợp pháp, chính đáng của đoàn viên
          </h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/90">
            Cổng thông tin điện tử chính thức của Công đoàn trường — cập nhật tin tức, hoạt động
            phong trào và các tiện ích số dành cho cán bộ, giảng viên, người lao động.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/tin-tuc">Xem tin tức</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/gioi-thieu">Giới thiệu Công đoàn</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lối tắt */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTCUTS.map((item) => (
            <Link key={item.to} to={item.to}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <item.icon className="size-5" />
                    </span>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {"badge" in item ? (
                    <span className="mt-3 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Tin tức mới nhất */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tin tức mới nhất</h2>
          <Button asChild variant="link">
            <Link to="/tin-tuc">Xem tất cả →</Link>
          </Button>
        </div>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : posts === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có tin tức nào được đăng.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
