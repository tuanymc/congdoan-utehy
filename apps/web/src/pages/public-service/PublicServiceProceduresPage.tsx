import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PUBLIC_SERVICE_PROCEDURE_CATEGORIES, PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS } from "@congdoan/types";
import type { PublicServiceProcedureCategory, PublicServiceProcedureListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PUBLIC_SERVICE_CATEGORY_ICONS } from "./category-icons";

const ALL_CATEGORY = "ALL";

/** Nhóm 1 (Tra cứu nhanh) + lối vào Nhóm 2 (Hướng dẫn từng bước, xem chi tiết ở PublicServiceProcedureDetailPage) —
 * lọc theo category qua query param (?category=...) truyền từ lưới ở PublicServiceHubPage. */
export function PublicServiceProceduresPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = (searchParams.get("category") as PublicServiceProcedureCategory | null) ?? ALL_CATEGORY;

  const [items, setItems] = useState<PublicServiceProcedureListItemDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setItems(null);

    const query = activeCategory === ALL_CATEGORY ? "" : `?category=${activeCategory}`;
    apiFetch<PublicServiceProcedureListItemDto[]>(`/public-service-procedures${query}`)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải danh sách thủ tục.");
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  function selectCategory(category: string) {
    if (category === ALL_CATEGORY) {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Tra cứu nhanh dịch vụ công</h1>
      <p className="mt-2 text-muted-foreground">Chọn 1 thủ tục để xem hướng dẫn đầy đủ: điều kiện, hồ sơ, nơi thực hiện, các bước, phí, thời hạn, cách nhận kết quả và lỗi thường gặp.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge
          variant={activeCategory === ALL_CATEGORY ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => selectCategory(ALL_CATEGORY)}
        >
          Tất cả
        </Badge>
        {PUBLIC_SERVICE_PROCEDURE_CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => selectCategory(category)}
          >
            {PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS[category]}
          </Badge>
        ))}
      </div>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : items === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có thủ tục nào trong nhóm này.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = PUBLIC_SERVICE_CATEGORY_ICONS[item.category];
              return (
                <Link key={item.id} to={`/tien-ich-so-cong-doan/dich-vu-cong/thu-tuc/${item.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full flex-col gap-3 py-5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <div className="flex-1">
                        <p className="font-medium hover:text-primary">{item.title}</p>
                        {item.summary ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p> : null}
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
  );
}
