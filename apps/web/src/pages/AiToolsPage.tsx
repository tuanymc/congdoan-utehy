import { useEffect, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import type { PublicAiToolResourceDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const UNCATEGORIZED_LABEL = "Khác";

function groupByCategory(items: PublicAiToolResourceDto[]): [string, PublicAiToolResourceDto[]][] {
  const groups = new Map<string, PublicAiToolResourceDto[]>();
  for (const item of items) {
    const key = item.category?.trim() || UNCATEGORIZED_LABEL;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return Array.from(groups.entries());
}

/** "Kho công cụ AI" — Tiện ích số Công đoàn (Phase 4c). Route bọc trong ProtectedRoute (xem App.tsx) —
 * chỉ đoàn viên đã đăng nhập mới vào được trang này, khớp thiết kế đã xác nhận: đây là thư mục/kho
 * công cụ AI được tuyển chọn (link ra ngoài), KHÔNG phải trợ lý AI thật xây trong web. */
export function AiToolsPage() {
  const [items, setItems] = useState<PublicAiToolResourceDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setItems(null);

    apiFetch<PublicAiToolResourceDto[]>("/ai-tools")
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Không thể tải danh sách công cụ AI.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const groups = items ? groupByCategory(items) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-2">
        <Sparkles className="size-6 text-primary" />
        <h1 className="text-3xl font-bold">Kho công cụ AI</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Các công cụ AI được tuyển chọn phục vụ giảng dạy, nghiên cứu — dành riêng cho đoàn viên đã đăng nhập.
        Bấm vào để mở công cụ (đăng nhập/sử dụng theo tài khoản riêng của từng công cụ, không liên quan tài
        khoản Công đoàn của bạn).
      </p>

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
          <p className="text-sm text-muted-foreground">Chưa có công cụ AI nào được thêm vào kho.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map(([category, tools]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold">{category}</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <a key={tool.id} href={tool.url} target="_blank" rel="noopener noreferrer">
                      <Card className="h-full transition-shadow hover:shadow-md">
                        <CardContent className="flex h-full flex-col gap-3 py-5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <Sparkles className="size-5" />
                            </span>
                            <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium hover:text-primary">{tool.name}</p>
                            {tool.description ? (
                              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{tool.description}</p>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    </a>
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
