import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Building2,
  Flag,
  Landmark,
  Megaphone,
  Scale,
  Shield,
  Users
} from "lucide-react";
import type { PaginatedResult, PostListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const FUNCTIONS = [
  {
    icon: Shield,
    text: "Đại diện, chăm lo và bảo vệ quyền, lợi ích hợp pháp, chính đáng của cán bộ, giảng viên, người lao động."
  },
  {
    icon: Scale,
    text: "Tham gia quản lý nhà trường, giám sát thực hiện chế độ, chính sách đối với người lao động."
  },
  {
    icon: Flag,
    text: "Tổ chức phong trào thi đua yêu nước, các hoạt động văn hoá, văn nghệ, thể dục thể thao."
  },
  {
    icon: Megaphone,
    text: "Tuyên truyền, vận động đoàn viên chấp hành chủ trương, đường lối của Đảng, chính sách, pháp luật của Nhà nước."
  }
] as const;

/** Số liệu xác thực từ trang Giới thiệu chung web cũ (https://congdoan.utehy.edu.vn/gioi-thieu/gioi-thieu-chung-20)
 * — năm thành lập 1966, huân chương Lao động hạng Ba (1986)/hạng Nhất (1996), huân chương Độc lập
 * hạng Ba (2001). Giữ cứng ở đây vì đây là số liệu lịch sử cố định, không đổi theo thời gian như tin
 * tức — không cần lấy động qua API. */
const STATS = [
  { value: "1966", label: "Năm thành lập" },
  { value: "60+", label: "Năm truyền thống" },
  { value: "3", label: "Huân chương đã được trao tặng" }
];

/** Mã nguồn thật (không phải tblCategory riêng) — toàn bộ nội dung "Giới thiệu" web cũ (Giới thiệu
 * chung, Ban chấp hành, Cơ cấu tổ chức, các ban chuyên môn...) đều là CÁC BÀI VIẾT (Post) nằm trong
 * DUY NHẤT 1 category "Giới thiệu" (slug "gioi-thieu", legacyCode "1") — đã xác nhận thật qua
 * GET /posts?categorySlug=gioi-thieu trên dữ liệu production, KHÔNG phải suy đoán. Ban đầu ETL gắn cờ
 * Category.isAboutSection theo tên category khớp menu web cũ, nhưng chỉ đúng 4/13 mục (Ban chuyên
 * môn, Ban Thanh tra nhân dân, Ban Chính sách pháp luật, Văn phòng — các category có tên khớp thật) vì
 * 9 mục còn lại (Giới thiệu chung, Ban chấp hành, Cơ cấu tổ chức...) không phải category độc lập. Trang
 * này vì vậy lấy thẳng theo categorySlug "gioi-thieu" rồi tự nhóm theo slug bài viết đã biết, thay vì
 * dựa vào isAboutSection.
 */
const CATEGORY_SLUG = "gioi-thieu";

interface AboutGroup {
  /** Dùng làm #id neo (anchor) — Header.tsx trỏ dropdown "Giới thiệu" thẳng tới các id này
   * (vd /gioi-thieu#ban-chap-hanh-cong-doan), phải giữ khớp khi đổi title hoặc thêm nhóm mới. */
  id: string;
  title: string;
  /** Slug bài viết theo đúng thứ tự hiển thị mong muốn (khớp thứ tự menu "Giới thiệu" web cũ). */
  slugs: string[];
}

const GROUPS: AboutGroup[] = [
  {
    id: "gioi-thieu-chung",
    title: "Giới thiệu chung",
    slugs: ["gioi-thieu-chung", "chuc-nang-nhiem-vu", "co-cau-to-chuc", "doi-ngu-can-bo"]
  },
  {
    id: "ban-chap-hanh-cong-doan",
    title: "Ban Chấp hành Công đoàn",
    slugs: [
      "ban-chap-hanh",
      "danh-ba-to-chuc-cac-nhiem-ky",
      "ban-chap-hanh-cong-doan-truong-nhiem-ky-2025-2030",
      "ban-chap-hanh-cong-doan-truong-nhiem-ky-2023-2028",
      "ban-chap-hanh-cong-doan-truong-nhiem-ky-xvii-2017-2022",
      "ban-chap-hanh-cong-doan-truong-nhiem-ky-xvi-2012-2017",
      "ban-chap-hanh-cong-doan-truong-nhiem-ky-xv-2008-2012",
      "ban-chap-hanh-cong-doan-truong-nhiem-ky-xiv-2003-2008",
      "ban-chap-hanh-cong-doan-truong-nhiem-ky-xiii-1998-2003"
    ]
  },
  {
    id: "cac-ban-chuyen-mon",
    title: "Các ban chuyên môn",
    slugs: [
      "ban-chuyen-mon",
      "uy-ban-kiem-tra",
      "ban-thanh-tra-nhan-dan",
      "ban-tuyen-giao-nu-cong",
      "ban-van-the",
      "ban-tai-chinh",
      "ban-chinh-sach-phap-luat",
      "van-phong"
    ]
  }
];

const GROUP_ICONS: Record<string, typeof Landmark> = {
  "gioi-thieu-chung": Landmark,
  "ban-chap-hanh-cong-doan": Award,
  "cac-ban-chuyen-mon": Building2,
  khac: Users
};

function formatDate(dateIso: string | null): string {
  if (!dateIso) return "";
  return new Date(dateIso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function groupPosts(posts: PostListItemDto[]): { id: string; title: string; posts: PostListItemDto[] }[] {
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const used = new Set<string>();

  const grouped = GROUPS.map((group) => {
    const groupPostsInOrder = group.slugs
      .map((slug) => bySlug.get(slug))
      .filter((post): post is PostListItemDto => Boolean(post));
    groupPostsInOrder.forEach((post) => used.add(post.slug));
    return { id: group.id, title: group.title, posts: groupPostsInOrder };
  }).filter((group) => group.posts.length > 0);

  // Bài viết mới thêm sau này trong category "Giới thiệu" nhưng chưa kịp xếp vào 1 trong 3 nhóm ở
  // trên (vd bài test, bài mới chưa phân loại) — vẫn hiển thị đầy đủ, không âm thầm ẩn dữ liệu thật.
  const remaining = posts.filter((post) => !used.has(post.slug));
  if (remaining.length > 0) {
    grouped.push({ id: "khac", title: "Khác", posts: remaining });
  }

  return grouped;
}

function ArticleTile({ post, featured = false }: { post: PostListItemDto; featured?: boolean }) {
  return (
    <Link
      to={`/tin-tuc/${post.slug}`}
      className={`group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md ${
        featured ? "sm:col-span-2" : ""
      }`}
    >
      <div className={featured ? "grid sm:grid-cols-2" : ""}>
        <div className={`overflow-hidden bg-muted ${featured ? "aspect-[16/10] sm:aspect-auto sm:min-h-56" : "aspect-[16/10]"}`}>
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 to-[#0f2a6b]/10">
              <Landmark className="size-10 text-primary/40" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center p-4 sm:p-5">
          <p className="font-semibold leading-snug group-hover:text-primary">{post.title}</p>
          {post.excerpt ? (
            <p className={`mt-2 text-sm text-muted-foreground ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
              {post.excerpt}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-muted-foreground">{formatDate(post.publishedAt ?? post.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Trang "Giới thiệu" — lấy toàn bộ bài viết trong category "Giới thiệu" (categorySlug=gioi-thieu,
 * xem chú thích CATEGORY_SLUG phía trên) rồi tự nhóm lại theo đúng thứ tự menu dropdown "Giới thiệu"
 * của web cũ, thay vì hiển thị 1 danh sách phẳng 22 bài không phân loại.
 */
export function AboutPage() {
  const [posts, setPosts] = useState<PostListItemDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setPosts(null);

    apiFetch<PaginatedResult<PostListItemDto>>(`/posts?categorySlug=${CATEGORY_SLUG}&pageSize=50`)
      .then((result) => {
        if (!cancelled) setPosts(result.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải nội dung Giới thiệu.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const groups = posts ? groupPosts(posts) : null;

  // Cuộn tới đúng nhóm khi vào trang qua link neo từ menu dropdown "Giới thiệu" (Header.tsx), vd
  // /gioi-thieu#ban-chap-hanh-cong-doan — phải đợi groups tải xong (DOM có id) mới cuộn được.
  useEffect(() => {
    if (!groups || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ cần chạy lại khi groups đổi từ null sang có dữ liệu, không phụ thuộc window.location.hash (không đổi trong đời trang này).
  }, [groups]);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-[#0f2a6b] text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Công đoàn UTEHY</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">Giới thiệu Công đoàn Trường</h1>
          <p className="mt-4 max-w-2xl text-base text-primary-foreground/90 sm:text-lg">
            Tổ chức đại diện, chăm lo và bảo vệ quyền lợi hợp pháp, chính đáng của cán bộ, giảng viên, người lao
            động Trường Đại học Sư phạm Kỹ thuật Hưng Yên.
          </p>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-6 border-t border-primary-foreground/20 pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-secondary sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-xs text-primary-foreground/80 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {groups && groups.length > 0 ? (
        <nav className="border-b bg-background">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
            <a
              href="#chuc-nang-nhiem-vu-cong-doan"
              className="shrink-0 rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Chức năng, nhiệm vụ
            </a>
            {groups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="shrink-0 rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {group.title}
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <section id="chuc-nang-nhiem-vu-cong-doan" className="scroll-mt-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Sứ mệnh</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Chức năng, nhiệm vụ</h2>
            <p className="mt-2 text-muted-foreground">
              Công đoàn Trường thực hiện bốn nhóm nhiệm vụ cốt lõi theo Luật Công đoàn và Điều lệ Công đoàn
              Việt Nam.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FUNCTIONS.map((item, index) => (
              <Card key={item.text} className="border-l-4 border-l-primary">
                <CardContent className="flex gap-4 py-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">0{index + 1}</p>
                    <p className="mt-1 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="mt-16 flex flex-col gap-16">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : groups === null ? (
            <>
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </>
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground">
                  Nội dung chi tiết (lịch sử hình thành, cơ cấu tổ chức, Ban Chấp hành...) sẽ được Công đoàn
                  trường cập nhật tại đây.
                </p>
              </CardContent>
            </Card>
          ) : (
            groups.map((group) => {
              const Icon = GROUP_ICONS[group.id] ?? Landmark;
              const [featured, ...rest] = group.posts;
              return (
                <section key={group.id} id={group.id} className="scroll-mt-24">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <h2 className="text-2xl font-bold">{group.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{group.posts.length} nội dung</p>
                      </div>
                    </div>
                  </div>

                  {group.id === "ban-chap-hanh-cong-doan" ? (
                    <Link to="/ban-chap-hanh" className="mt-6 block">
                      <Card className="border-primary/30 bg-primary/5 transition-shadow hover:shadow-md">
                        <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">Danh sách Ban chấp hành theo nhiệm kỳ</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Xem thành viên Ban chấp hành Công đoàn Trường và các công đoàn bộ phận, lọc theo
                              từng nhiệm kỳ.
                            </p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                            Xem danh sách đầy đủ <ArrowRight className="size-4" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ) : null}

                  {featured ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <ArticleTile post={featured} featured />
                      {rest.map((post) => (
                        <ArticleTile key={post.id} post={post} />
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })
          )}
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-[#0f2a6b] px-6 py-10 text-primary-foreground sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Kết nối</p>
          <h2 className="mt-2 max-w-xl text-2xl font-bold">Đồng hành cùng đoàn viên Công đoàn UTEHY</h2>
          <p className="mt-2 max-w-xl text-primary-foreground/85">
            Tra cứu danh bạ công đoàn viên, gửi liên hệ tới Văn phòng Công đoàn, hoặc đăng nhập cổng đoàn viên
            để sử dụng tiện ích số.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/danh-ba-cong-doan-vien">Danh bạ công đoàn viên</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/lien-he">Liên hệ</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
