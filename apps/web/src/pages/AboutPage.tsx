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
import { Skeleton } from "@/components/ui/skeleton";

const FUNCTIONS = [
  {
    icon: Shield,
    title: "Đại diện và chăm lo quyền lợi",
    text: "Đại diện, chăm lo và bảo vệ quyền, lợi ích hợp pháp, chính đáng của cán bộ, giảng viên, người lao động."
  },
  {
    icon: Scale,
    title: "Tham gia quản lý nhà trường",
    text: "Tham gia quản lý nhà trường, giám sát thực hiện chế độ, chính sách đối với người lao động."
  },
  {
    icon: Flag,
    title: "Tổ chức phong trào thi đua",
    text: "Tổ chức phong trào thi đua yêu nước, các hoạt động văn hoá, văn nghệ, thể dục thể thao."
  },
  {
    icon: Megaphone,
    title: "Tuyên truyền, vận động",
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

function SectionEyebrow({ index, label }: { index: string; label: string }) {
  return (
    <p className="flex items-center gap-3 text-sm font-medium text-primary">
      <span className="font-mono text-xs tracking-widest text-primary/70">{index}</span>
      <span className="h-px w-8 bg-primary/40" />
      {label}
    </p>
  );
}

/** Bài giới thiệu dài (ảnh chỉ hiện khi có cover thật — không vẽ ô trống). */
function EditorialCard({ post, featured = false }: { post: PostListItemDto; featured?: boolean }) {
  return (
    <Link
      to={`/tin-tuc/${post.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border/80 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/30 ${
        featured ? "sm:col-span-2 sm:flex-row" : ""
      }`}
    >
      {post.coverImageUrl ? (
        <div className={`overflow-hidden bg-muted ${featured ? "aspect-[16/10] sm:aspect-auto sm:w-[46%] sm:min-h-64" : "aspect-[16/10]"}`}>
          <img
            src={post.coverImageUrl}
            alt=""
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : null}
      <div className={`flex flex-1 flex-col justify-center p-5 sm:p-6 ${!post.coverImageUrl && featured ? "sm:px-10 sm:py-10" : ""}`}>
        <p className="text-lg font-semibold leading-snug tracking-tight group-hover:text-primary">{post.title}</p>
        {post.excerpt ? (
          <p className={`mt-2 text-sm leading-relaxed text-muted-foreground ${featured ? "line-clamp-4" : "line-clamp-2"}`}>
            {post.excerpt}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Đọc tiếp <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Danh mục ban chuyên môn — ô compact, không dùng card ảnh. */
function DirectoryLink({ post }: { post: PostListItemDto }) {
  return (
    <Link
      to={`/tin-tuc/${post.slug}`}
      className="group flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-4 ring-1 ring-border/80 transition-all hover:bg-primary hover:text-primary-foreground hover:ring-primary"
    >
      <span className="font-medium leading-snug">{post.title}</span>
      <ArrowRight className="size-4 shrink-0 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  );
}

/** Lịch sử nhiệm kỳ Ban chấp hành — timeline, đọc như niên biểu chứ không phải lưới tin. */
function TimelineItem({ post, isLast }: { post: PostListItemDto; isLast: boolean }) {
  return (
    <li className="relative pl-8">
      {!isLast ? <span className="absolute top-3 left-[7px] h-[calc(100%+0.75rem)] w-px bg-border" /> : null}
      <span className="absolute top-2.5 left-0 size-4 rounded-full border-2 border-primary bg-background" />
      <Link to={`/tin-tuc/${post.slug}`} className="group block rounded-xl py-1 pr-2 transition-colors hover:text-primary">
        <p className="font-medium leading-snug">{post.title}</p>
        {post.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p> : null}
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Xem chi tiết <ArrowRight className="size-3" />
        </span>
      </Link>
    </li>
  );
}

function GroupBody({ group }: { group: { id: string; title: string; posts: PostListItemDto[] } }) {
  if (group.id === "cac-ban-chuyen-mon") {
    return (
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {group.posts.map((post) => (
          <DirectoryLink key={post.id} post={post} />
        ))}
      </div>
    );
  }

  if (group.id === "ban-chap-hanh-cong-doan") {
    const overview = group.posts.filter((post) => !/nhiem-ky/i.test(post.slug));
    const terms = group.posts.filter((post) => /nhiem-ky/i.test(post.slug));
    return (
      <div className="mt-8 space-y-8">
        {overview.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {overview.map((post, index) => (
              <EditorialCard key={post.id} post={post} featured={index === 0 && overview.length === 1} />
            ))}
          </div>
        ) : null}
        {terms.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Qua các nhiệm kỳ</p>
            <ol className="mt-4 space-y-5">
              {terms.map((post, index) => (
                <TimelineItem key={post.id} post={post} isLast={index === terms.length - 1} />
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    );
  }

  const [featured, ...rest] = group.posts;
  if (!featured) return null;
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <EditorialCard post={featured} featured />
      {rest.map((post) => (
        <EditorialCard key={post.id} post={post} />
      ))}
    </div>
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
        <nav className="border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
            {[
              { href: "#chuc-nang-nhiem-vu-cong-doan", label: "Chức năng, nhiệm vụ" },
              ...groups.map((group) => ({ href: `#${group.id}`, label: group.title }))
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}

      <section id="chuc-nang-nhiem-vu-cong-doan" className="scroll-mt-24 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <SectionEyebrow index="01" label="Sứ mệnh" />
          <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">Chức năng, nhiệm vụ</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Bốn nhóm nhiệm vụ cốt lõi theo Luật Công đoàn và Điều lệ Công đoàn Việt Nam.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border sm:grid-cols-2">
            {FUNCTIONS.map((item, index) => (
              <div key={item.title} className="relative bg-card p-6 sm:p-8">
                <span className="pointer-events-none absolute top-4 right-5 font-mono text-5xl font-bold text-primary/[0.07] sm:text-6xl">
                  0{index + 1}
                </span>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : groups === null ? (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-16">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      ) : groups.length === 0 ? (
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm text-muted-foreground">
            Nội dung chi tiết (lịch sử hình thành, cơ cấu tổ chức, Ban Chấp hành...) sẽ được Công đoàn trường cập
            nhật tại đây.
          </p>
        </div>
      ) : (
        groups.map((group, groupIndex) => {
          const Icon = GROUP_ICONS[group.id] ?? Landmark;
          const indexLabel = String(groupIndex + 2).padStart(2, "0");
          const muted = groupIndex % 2 === 0;
          return (
            <section
              key={group.id}
              id={group.id}
              className={`scroll-mt-24 ${muted ? "bg-background" : "bg-muted/40"}`}
            >
              <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <SectionEyebrow index={indexLabel} label={group.title} />
                    <div className="mt-3 flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{group.title}</h2>
                    </div>
                  </div>
                  {group.id === "ban-chap-hanh-cong-doan" ? (
                    <Button asChild>
                      <Link to="/ban-chap-hanh">
                        Danh sách Ban chấp hành hiện nay <ArrowRight />
                      </Link>
                    </Button>
                  ) : null}
                </div>
                <GroupBody group={group} />
              </div>
            </section>
          );
        })
      )}

      <section className="bg-gradient-to-br from-primary to-[#0f2a6b] text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Kết nối</p>
          <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight">Đồng hành cùng đoàn viên Công đoàn UTEHY</h2>
          <p className="mt-3 max-w-xl text-primary-foreground/85">
            Tra cứu danh bạ công đoàn viên hoặc gửi liên hệ tới Văn phòng Công đoàn trường.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
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
      </section>
    </div>
  );
}
