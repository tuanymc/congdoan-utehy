import { useEffect, useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";
import type { PublicServiceLinkPublicDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const UNCATEGORIZED_LABEL = "Cổng chuyên ngành khác";

function groupByGroup(items: PublicServiceLinkPublicDto[]): [string, PublicServiceLinkPublicDto[]][] {
  const groups = new Map<string, PublicServiceLinkPublicDto[]>();
  for (const item of items) {
    const key = item.group?.trim() || UNCATEGORIZED_LABEL;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return Array.from(groups.entries());
}

/** Sinh ảnh mã QR trực tiếp từ URL bằng dịch vụ ảnh QR công khai (api.qrserver.com) — KHÔNG lưu ảnh QR
 * ở BE, không thêm thư viện tạo QR mới (xem ghi chú model PublicServiceLink trong schema.prisma). */
function qrCodeImageUrl(targetUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(targetUrl)}`;
}

/** Nhóm 3 (Kho biểu mẫu và đường dẫn chính thống) — mỗi liên kết kèm mã QR để đoàn viên quét truy cập
 * ngay bằng điện thoại, theo đúng gợi ý của người quản trị. */
export function PublicServiceLinksPage() {
  const [items, setItems] = useState<PublicServiceLinkPublicDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setItems(null);

    apiFetch<PublicServiceLinkPublicDto[]>("/public-service-links")
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Không thể tải kho liên kết.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const groups = items ? groupByGroup(items) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-2">
        <Link2 className="size-6 text-primary" />
        <h1 className="text-3xl font-bold">Kho biểu mẫu và đường dẫn chính thống</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Liên kết trực tiếp tới các cổng dịch vụ công chính thống — bấm vào để mở, hoặc dùng điện thoại quét mã QR
        để truy cập ngay.
      </p>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : items === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có liên kết nào được thêm vào kho.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map(([group, links]) => (
              <div key={group}>
                <h2 className="text-lg font-semibold">{group}</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {links.map((link) => (
                    <Card key={link.id} className="h-full">
                      <CardContent className="flex h-full flex-col gap-3 py-5 sm:flex-row sm:items-center">
                        <img
                          src={qrCodeImageUrl(link.url)}
                          alt={`Mã QR truy cập ${link.title}`}
                          width={96}
                          height={96}
                          className="size-24 shrink-0 rounded-md border bg-white p-1"
                        />
                        <div className="min-w-0 flex-1">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-medium hover:text-primary"
                          >
                            <span className="truncate">{link.title}</span>
                            <ExternalLink className="size-3.5 shrink-0" />
                          </a>
                          {link.description ? (
                            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{link.description}</p>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
