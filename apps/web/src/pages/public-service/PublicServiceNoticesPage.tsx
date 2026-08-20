import { useEffect, useState } from "react";
import { BellRing, Pin } from "lucide-react";
import { PUBLIC_SERVICE_NOTICE_CATEGORY_LABELS } from "@congdoan/types";
import type { PublicServiceNoticePublicDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Nhóm 5 (Cảnh báo và nhắc việc) — bảng tin CHUNG do cán bộ Công đoàn đăng, không cá nhân hoá, không
 * yêu cầu đăng nhập (xem ghi chú model PublicServiceNotice trong schema.prisma). */
export function PublicServiceNoticesPage() {
  const [items, setItems] = useState<PublicServiceNoticePublicDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setItems(null);

    apiFetch<PublicServiceNoticePublicDto[]>("/public-service-notices")
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Không thể tải danh sách thông báo.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-2">
        <BellRing className="size-6 text-primary" />
        <h1 className="text-3xl font-bold">Cảnh báo và nhắc việc</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Các thông báo, nhắc việc từ Công đoàn trường: hạn giấy phép lái xe, thay đổi chính sách BHXH/BHYT, quyết
        toán thuế thu nhập cá nhân, dịch vụ công trực tuyến mới...
      </p>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : items === null ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hiện chưa có thông báo nào.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <Card key={item.id} className={item.isPinned ? "border-primary/40 bg-primary/5" : undefined}>
                <CardContent className="py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.isPinned ? <Pin className="size-4 shrink-0 text-primary" /> : null}
                    <p className="font-medium">{item.title}</p>
                    {item.category ? <Badge variant="outline">{PUBLIC_SERVICE_NOTICE_CATEGORY_LABELS[item.category]}</Badge> : null}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{item.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
