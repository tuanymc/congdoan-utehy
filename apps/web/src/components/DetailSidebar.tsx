import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export interface DetailSidebarItem {
  id: string;
  href: string;
  title: string;
  meta?: string;
}

/**
 * Cột phụ dùng chung cho trang chi tiết Tin tức + Văn bản — liệt kê nhanh các mục khác (cùng chuyên
 * mục/loại) để người dùng bấm chuyển sang xem mà không cần quay lại trang danh sách. Dùng chung 1
 * component để 2 trang luôn nhất quán giao diện thay vì mỗi trang tự viết 1 kiểu.
 */
export function DetailSidebar({
  title,
  items,
  isLoading,
  viewAllHref,
  viewAllLabel,
  emptyLabel
}: {
  title: string;
  items: DetailSidebarItem[];
  isLoading: boolean;
  viewAllHref: string;
  viewAllLabel: string;
  emptyLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-1">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-primary"
            >
              <p className="line-clamp-2 font-medium">{item.title}</p>
              {item.meta ? <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p> : null}
            </Link>
          ))
        )}
        <Button asChild variant="link" className="mt-2 h-auto justify-start p-0">
          <Link to={viewAllHref}>{viewAllLabel} →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
