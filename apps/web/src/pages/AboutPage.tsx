import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CategoryDto, PaginatedResult, PostListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const FUNCTIONS = [
  "Đại diện, chăm lo và bảo vệ quyền, lợi ích hợp pháp, chính đáng của cán bộ, giảng viên, người lao động.",
  "Tham gia quản lý nhà trường, giám sát thực hiện chế độ, chính sách đối với người lao động.",
  "Tổ chức phong trào thi đua yêu nước, các hoạt động văn hoá, văn nghệ, thể dục thể thao.",
  "Tuyên truyền, vận động đoàn viên chấp hành chủ trương, đường lối của Đảng, chính sách, pháp luật của Nhà nước."
];

interface AboutSection {
  category: CategoryDto;
  posts: PostListItemDto[];
}

function formatDate(dateIso: string | null): string {
  if (!dateIso) return "";
  return new Date(dateIso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Trang "Giới thiệu" — thay vì hard-code nội dung tĩnh, gom bài viết của các chuyên mục có
 * isAboutSection=true (Giới thiệu chung, Ban chấp hành, Cơ cấu tổ chức...) — xem
 * Category.isAboutSection trong prisma/schema.prisma và isAboutCategoryName() trong
 * migrate-legacy-content.ts. Sau khi chạy ETL trên dữ liệu web cũ, các mục dưới đây sẽ tự có nội dung
 * thật khớp đúng menu "Giới thiệu" của web cũ mà không cần sửa code trang này.
 */
export function AboutPage() {
  const [sections, setSections] = useState<AboutSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    apiFetch<CategoryDto[]>("/categories?aboutOnly=true")
      .then(async (categories) => {
        const results = await Promise.all(
          categories.map(async (category) => {
            const posts = await apiFetch<PaginatedResult<PostListItemDto>>(
              `/posts?categorySlug=${encodeURIComponent(category.slug)}&pageSize=6`
            );
            return { category, posts: posts.items };
          })
        );
        if (!cancelled) setSections(results);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải nội dung Giới thiệu.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Giới thiệu Công đoàn Trường</h1>
      <p className="mt-2 text-muted-foreground">Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên</p>

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
        ) : sections === null ? (
          <>
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </>
        ) : sections.every((section) => section.posts.length === 0) ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Nội dung chi tiết (lịch sử hình thành, cơ cấu tổ chức, Ban Chấp hành...) sẽ được Công đoàn
                trường cập nhật tại đây.
              </p>
            </CardContent>
          </Card>
        ) : (
          sections.map((section) =>
            section.posts.length === 0 ? null : (
              <Card key={section.category.id}>
                <CardHeader>
                  <CardTitle>{section.category.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {section.posts.map((post) => (
                    <Link key={post.id} to={`/tin-tuc/${post.slug}`} className="block group">
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
            )
          )
        )}
      </div>
    </div>
  );
}
