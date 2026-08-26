import { Link } from "react-router-dom";
import { DIGITAL_HANDBOOK_CATEGORY_SLUG, DIGITAL_HANDBOOK_PATH, type PostListItemDto } from "@congdoan/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function postHref(post: PostListItemDto): string {
  if (post.category.slug === DIGITAL_HANDBOOK_CATEGORY_SLUG) {
    return `${DIGITAL_HANDBOOK_PATH}/${post.slug}`;
  }
  return `/tin-tuc/${post.slug}`;
}

function formatDate(dateIso: string | null): string {
  if (!dateIso) return "";
  return new Date(dateIso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function PostCard({ post }: { post: PostListItemDto }) {
  const href = postHref(post);
  return (
    <Card className="overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link to={href} className="block">
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="size-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              Công đoàn UTEHY
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="pt-4">
        <Badge variant="secondary" className="w-fit">
          {post.category.name}
        </Badge>
        <CardTitle className="line-clamp-2 text-base">
          <Link to={href} className="hover:text-primary">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5">
        {post.excerpt ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        ) : null}
        <p className="mt-2 text-xs text-muted-foreground">
          {formatDate(post.publishedAt ?? post.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
}
