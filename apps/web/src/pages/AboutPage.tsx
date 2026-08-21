import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { PaginatedResult, PostListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const FUNCTIONS = [
  "Đại diện, chăm lo và bảo vệ quyền, lợi ích hợp pháp, chính đáng của cán bộ, giảng viên, người lao động.",
  "Tham gia quản lý nhà trường, giám sát thực hiện chế độ, chính sách đối với người lao động.",
  "Tổ chức phong trào thi đua yêu nước, các hoạt động văn hoá, văn nghệ, thể dục thể thao.",
  "Tuyên truyền, vận động đoàn viên chấp hành chủ trương, đường lối của Đảng, chính sách, pháp luật của Nhà nước."
];

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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Giới thiệu Công đoàn Trường</h1>
      <p className="mt-2 text-muted-foreground">Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên</p>

      {/* Số liệu truyền thống — xem chú thích STATS phía trên. */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card px-3 py-4 text-center">
            <p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Chức năng, nhiệm vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {FUNCTIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-6">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : groups === null ? (
          <>
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </>
        ) : groups.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Nội dung chi tiết (lịch sử hình thành, cơ cấu tổ chức, Ban Chấp hành...) sẽ được Công đoàn
                trường cập nhật tại đây.
              </p>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Card key={group.title} id={group.id} className="scroll-mt-20">
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
                {group.id === "ban-chap-hanh-cong-doan" ? (
                  <Link to="/ban-chap-hanh" className="text-sm text-primary hover:underline">
                    Xem danh sách Ban chấp hành đầy đủ theo từng nhiệm kỳ →
                  </Link>
                ) : null}
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {group.posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/tin-tuc/${post.slug}`}
                    className="block rounded-lg border p-3 transition-colors hover:border-primary hover:bg-accent/50"
                  >
                    <p className="font-medium group-hover:text-primary">{post.title}</p>
                    {post.excerpt ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
