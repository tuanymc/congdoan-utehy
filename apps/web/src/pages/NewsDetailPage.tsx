import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PostDetailDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NotFoundPage } from "./NotFoundPage";

function formatDate(dateIso: string | null): string {
  if (!dateIso) return "";
  return new Date(dateIso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostDetailDto | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setPost(null);
    setNotFound(false);
    setError(null);

    apiFetch<PostDetailDto>(`/posts/${slug}`)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Không thể tải bài viết.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return <NotFoundPage message="Không tìm thấy bài viết này. Bài viết có thể đã bị gỡ hoặc chưa được đăng." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-destructive">{error}</p>
        <Button asChild variant="link">
          <Link to="/tin-tuc">Quay lại danh sách tin tức</Link>
        </Button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="mt-6 h-72 w-full rounded-xl" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="link" className="mb-4 h-auto p-0">
        <Link to="/tin-tuc">← Quay lại danh sách tin tức</Link>
      </Button>

      <Badge variant="secondary">{post.category.name}</Badge>
      <h1 className="mt-3 text-3xl font-bold">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {post.authorFullName} · {formatDate(post.publishedAt ?? post.createdAt)}
      </p>

      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="mt-6 aspect-video w-full rounded-xl object-cover"
        />
      ) : null}

      {/*
        Nội dung bài viết do biên tập viên soạn (HTML đã được backend kiểm soát/lọc).
        Không dùng plugin @tailwindcss/typography (chưa cài) — style thủ công cho các thẻ HTML
        phổ biến (p, h2-h4, a, ul/ol, img, blockquote) qua selector con bên dưới.
      */}
      <div
        className={[
          "mt-8 max-w-none text-base leading-relaxed text-foreground",
          "[&_p]:my-4",
          "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold",
          "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold",
          "[&_a]:text-primary [&_a]:underline",
          "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_img]:my-4 [&_img]:rounded-lg",
          "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
