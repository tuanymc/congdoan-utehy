import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText } from "lucide-react";
import type { DocumentDirection, PaginatedResult, PublicOfficialDocumentListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";

const PAGE_SIZE = 12;

const DIRECTION_LABEL: Record<DocumentDirection, string> = {
  DRAFT: "Dự thảo",
  OUTGOING: "Công văn đi",
  INCOMING: "Công văn đến"
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Trang "Văn bản" công khai — thay phần công khai của hệ công văn web cũ. Chỉ hiển thị công văn
 * isPublic=true (xem PublicOfficialDocumentsController ở apps/api), lọc theo hướng công văn. */
export function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const direction = (searchParams.get("direction") ?? "") as DocumentDirection | "";

  const [result, setResult] = useState<PaginatedResult<PublicOfficialDocumentListItemDto> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setResult(null);

    const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (direction) query.set("direction", direction);

    apiFetch<PaginatedResult<PublicOfficialDocumentListItemDto>>(`/official-documents?${query.toString()}`)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải danh sách văn bản.");
      });

    return () => {
      cancelled = true;
    };
  }, [page, direction]);

  function selectDirection(next: DocumentDirection | "") {
    const params = new URLSearchParams(searchParams);
    if (next) {
      params.set("direction", next);
    } else {
      params.delete("direction");
    }
    params.delete("page");
    setSearchParams(params);
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const directionOptions: Array<{ value: DocumentDirection | ""; label: string }> = [
    { value: "", label: "Tất cả" },
    { value: "OUTGOING", label: DIRECTION_LABEL.OUTGOING },
    { value: "INCOMING", label: DIRECTION_LABEL.INCOMING }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Văn bản</h1>
      <p className="mt-2 text-muted-foreground">
        Công văn, thông báo do Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên ban hành và công khai.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {directionOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => selectDirection(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              direction === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : result === null ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : result.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có văn bản nào được công khai.</p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {result.items.map((doc) => (
                <Link key={doc.id} to={`/van-ban/${doc.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-start gap-4 py-4">
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <FileText className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{DIRECTION_LABEL[doc.direction]}</Badge>
                          <Badge variant="secondary">{doc.documentType.name}</Badge>
                          {doc.documentNumber ? (
                            <span className="text-xs text-muted-foreground">Số: {doc.documentNumber}</span>
                          ) : null}
                        </div>
                        <p className="mt-1.5 truncate font-medium hover:text-primary">{doc.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {doc.issuingOfficeName ? `${doc.issuingOfficeName} — ` : ""}
                          Ngày ban hành: {formatDate(doc.issuedAt)}
                        </p>
                      </div>
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
