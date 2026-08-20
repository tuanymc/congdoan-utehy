import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import type { PaginatedResult, PublicEventDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 12;

function formatDateTime(iso: string | null): string {
  if (!iso) return "Chưa có lịch cụ thể";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/** "Đăng ký hoạt động" — Tiện ích số Công đoàn (Phase 4b). Danh sách công khai các hoạt động
 * isPublic=true, sắp theo ngày bắt đầu gần nhất (khớp EventsService.listPublic). Bấm vào 1 hoạt động để
 * xem chi tiết + đăng ký ở EventDetailPage.tsx (route lồng "tien-ich-so-cong-doan/dang-ky-hoat-dong/:id",
 * giống cách "bieu-mau" lồng dưới "tien-ich-so-cong-doan" — xem App.tsx). */
export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [result, setResult] = useState<PaginatedResult<PublicEventDto> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setResult(null);

    const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });

    apiFetch<PaginatedResult<PublicEventDto>>(`/events?${query.toString()}`)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải danh sách hoạt động.");
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Đăng ký hoạt động</h1>
      <p className="mt-2 text-muted-foreground">
        Các hoạt động, phong trào do Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên tổ chức — bấm vào để xem
        chi tiết và đăng ký tham gia.
      </p>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : result === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : result.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hiện chưa có hoạt động nào đang mở đăng ký.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((eventItem) => (
                <Link key={eventItem.id} to={`/tien-ich-so-cong-doan/dang-ky-hoat-dong/${eventItem.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full flex-col gap-3 py-5">
                      <div className="flex-1">
                        <p className="font-medium hover:text-primary">{eventItem.title}</p>
                        {eventItem.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{eventItem.description}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5 shrink-0" />
                          {formatDateTime(eventItem.startAt)}
                        </span>
                        {eventItem.location ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0" />
                            {eventItem.location}
                          </span>
                        ) : null}
                      </div>
                      {eventItem.isFull ? (
                        <Badge variant="secondary" className="w-fit">
                          Đã đủ số lượng đăng ký
                        </Badge>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {result.totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {result.page} / {result.totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= result.totalPages} onClick={() => goToPage(page + 1)}>
                  Sau
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
