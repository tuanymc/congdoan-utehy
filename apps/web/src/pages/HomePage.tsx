import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DIGITAL_HANDBOOK_CATEGORY_SLUG,
  DIGITAL_HANDBOOK_PATH,
  type HomeSlideDto,
  type PaginatedResult,
  type PostListItemDto,
  type PublicSurveyListItemDto
} from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/PostCard";
import { HomeSlider } from "@/components/HomeSlider";
import { HomeBannerStrip } from "@/components/HomeBannerStrip";
import { HomeQuickAccess } from "@/components/HomeQuickAccess";
import { BookOpen, ClipboardList } from "lucide-react";

/** Số liệu truyền thống — xác thực từ trang Giới thiệu chung web cũ (huân chương Lao động hạng Ba
 * 1986/hạng Nhất 1996, huân chương Độc lập hạng Ba 2001) — trùng nguồn với STATS trong AboutPage.tsx. */
const HERO_STATS = [
  { value: "1966", label: "Năm thành lập" },
  { value: "60+", label: "Năm truyền thống" },
  { value: "3", label: "Huân chương" }
];

const HOME_DIGITAL_LIMIT = 3;

function formatDate(dateIso: string | null): string {
  if (!dateIso) return "";
  return new Date(dateIso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatSurveyDeadline(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function HomePage() {
  const [posts, setPosts] = useState<PostListItemDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<HomeSlideDto[]>([]);
  const [handbookPosts, setHandbookPosts] = useState<PostListItemDto[] | null>(null);
  const [surveys, setSurveys] = useState<PublicSurveyListItemDto[] | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    apiFetch<PaginatedResult<PostListItemDto>>(
      `/posts?categorySlug=${DIGITAL_HANDBOOK_CATEGORY_SLUG}&pageSize=${HOME_DIGITAL_LIMIT}`
    )
      .then((result) => {
        if (!cancelled) setHandbookPosts(result.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setHandbookPosts([]);
      });

    apiFetch<PublicSurveyListItemDto[]>("/surveys")
      .then((data) => {
        if (!cancelled) setSurveys((data ?? []).slice(0, HOME_DIGITAL_LIMIT));
      })
      .catch(() => {
        if (!cancelled) setSurveys([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    apiFetch<HomeSlideDto[]>("/home-slides")
      // "?? []" phòng trường hợp apiFetch trả về null (vd response 200 nhưng body rỗng bất thường) —
      // slides.length ở JSX bên dưới không tự chống null, để state lọt null vào sẽ crash trắng trang.
      .then((data) => setSlides(data ?? []))
      .catch(() => {
        // Không có banner nào (hoặc lỗi tải) -> chỉ ẩn slider, vẫn hiển thị phần còn lại của trang chủ.
      });
  }, []);

  const sliderSlides = slides.filter((slide) => (slide.placement ?? "SLIDER") === "SLIDER");
  const afterSlideBanners = slides.filter((slide) => slide.placement === "AFTER_SLIDE");
  const beforeFooterBanners = slides.filter((slide) => slide.placement === "BEFORE_FOOTER");

  return (
    <div>
      {sliderSlides.length > 0 ? <HomeSlider slides={sliderSlides} /> : null}

      <HomeBannerStrip banners={afterSlideBanners} className="py-4 sm:py-6" />

      {/* Banner giới thiệu — gradient xanh dương đậm dần, khớp bảng màu mới (xem apps/web/src/index.css,
       * --chart-5 cùng tông #0f2a6b). Trước là "to-[#78171b]" (đỏ) sót lại từ bảng màu cũ, gây lệch
       * tông khi đổi sang xanh dương làm màu chủ đạo. pb lớn hơn để card truy cập nhanh gối lên mép. */}
      <section className="bg-gradient-to-br from-primary to-[#0f2a6b] pb-16 text-primary-foreground sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
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

          {/* Số liệu truyền thống — xác thực từ trang Giới thiệu chung web cũ (xem chú thích STATS
           * trong AboutPage.tsx, cùng nguồn số liệu, giữ khớp 2 nơi). */}
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-primary-foreground/20 pt-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-secondary sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-primary-foreground/80 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="-mt-10 pb-10 sm:-mt-12 sm:pb-12">
        <HomeQuickAccess />
      </div>

      {/* Cẩm nang số + khảo sát — một section Tiện ích số trên trang chủ */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Tiện ích số</h2>
            <Button asChild variant="link" className="shrink-0">
              <Link to="/tien-ich-so-cong-doan">Tất cả tiện ích →</Link>
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <BookOpen className="size-5 text-primary" />
                  Cẩm nang - Kiến thức số
                </h3>
                <Button asChild variant="link" className="h-auto p-0">
                  <Link to={DIGITAL_HANDBOOK_PATH}>Xem tất cả →</Link>
                </Button>
              </div>
              {handbookPosts === null ? (
                <div className="space-y-3">
                  {Array.from({ length: HOME_DIGITAL_LIMIT }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-xl" />
                  ))}
                </div>
              ) : handbookPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có bài viết trong mục này.</p>
              ) : (
                <div className="space-y-3">
                  {handbookPosts.map((post) => (
                    <Link key={post.id} to={`${DIGITAL_HANDBOOK_PATH}/${post.slug}`} className="block">
                      <Card className="transition-shadow hover:shadow-md">
                        <CardContent className="flex gap-4 py-4">
                          <div className="hidden size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:block">
                            {post.coverImageUrl ? (
                              <img
                                src={post.coverImageUrl}
                                alt=""
                                className="size-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center text-primary">
                                <BookOpen className="size-6" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 font-medium hover:text-primary">{post.title}</p>
                            {post.excerpt ? (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                            ) : null}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(post.publishedAt ?? post.createdAt)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <ClipboardList className="size-5 text-primary" />
                  Khảo sát ý kiến
                </h3>
                <Button asChild variant="link" className="h-auto p-0">
                  <Link to="/tien-ich-so-cong-doan/khao-sat">Xem tất cả →</Link>
                </Button>
              </div>
              {surveys === null ? (
                <div className="space-y-3">
                  {Array.from({ length: HOME_DIGITAL_LIMIT }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full rounded-xl" />
                  ))}
                </div>
              ) : surveys.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hiện chưa có khảo sát nào đang mở.</p>
              ) : (
                <div className="space-y-3">
                  {surveys.map((survey) => {
                    const deadline = formatSurveyDeadline(survey.endAt);
                    return (
                      <Link key={survey.id} to={`/tien-ich-so-cong-doan/khao-sat/${survey.id}`} className="block">
                        <Card className="transition-shadow hover:shadow-md">
                          <CardContent className="flex gap-4 py-4">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <ClipboardList className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 font-medium hover:text-primary">{survey.title}</p>
                              {survey.description ? (
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{survey.description}</p>
                              ) : null}
                              <p className="mt-1 text-xs text-muted-foreground">
                                {survey.questionCount} câu hỏi
                                {deadline ? ` — hạn trả lời: ${deadline}` : ""}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tin tức mới nhất */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
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

      <HomeBannerStrip banners={beforeFooterBanners} className="pb-4 pt-2 sm:pb-6" />
    </div>
  );
}
