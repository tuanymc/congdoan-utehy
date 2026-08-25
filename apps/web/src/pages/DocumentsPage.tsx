import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, Search, X } from "lucide-react";
import type { DocumentDirection, DocumentTypeDto, PaginatedResult, PublicOfficialDocumentListItemDto } from "@congdoan/types";
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

const FIELD_CLASS =
  "w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Trang "Văn bản" công khai — tra cứu theo từ khóa, loại, hướng, khoảng ngày ban hành. */
export function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const direction = (searchParams.get("direction") ?? "") as DocumentDirection | "";
  const documentTypeId = searchParams.get("documentTypeId") ?? "";
  const issuedFrom = searchParams.get("issuedFrom") ?? "";
  const issuedTo = searchParams.get("issuedTo") ?? "";
  const search = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(search);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [result, setResult] = useState<PaginatedResult<PublicOfficialDocumentListItemDto> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    apiFetch<DocumentTypeDto[]>("/official-documents/types")
      .then((data) => setDocumentTypes(data ?? []))
      .catch(() => {
        // Không chặn trang khi lỗi tải loại văn bản — ẩn dropdown loại.
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      if ((params.get("search") ?? "") !== search) {
        params.delete("page");
        setSearchParams(params, { replace: true });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce theo searchInput, đối chiếu search hiện tại trên URL.
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setResult(null);

    const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (direction) query.set("direction", direction);
    if (documentTypeId) query.set("documentTypeId", documentTypeId);
    if (issuedFrom) query.set("issuedFrom", issuedFrom);
    if (issuedTo) query.set("issuedTo", issuedTo);
    if (search) query.set("search", search);

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
  }, [page, direction, documentTypeId, issuedFrom, issuedTo, search]);

  function patchParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
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

  function clearFilters() {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  }

  const hasFilters = Boolean(search || direction || documentTypeId || issuedFrom || issuedTo);
  const directionOptions: Array<{ value: DocumentDirection | ""; label: string }> = [
    { value: "", label: "Tất cả" },
    { value: "OUTGOING", label: DIRECTION_LABEL.OUTGOING },
    { value: "INCOMING", label: DIRECTION_LABEL.INCOMING }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Văn bản</h1>
      <p className="mt-2 text-muted-foreground">
        Tra cứu công văn, thông báo do Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên ban hành và công khai.
      </p>

      <Card className="mt-6">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nhập số hiệu, trích yếu, nội dung hoặc cơ quan ban hành..."
              className={cn(FIELD_CLASS, "pl-9")}
              aria-label="Từ khóa tra cứu văn bản"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-foreground">Loại văn bản</span>
              <select
                className={FIELD_CLASS}
                value={documentTypeId}
                onChange={(event) => patchParams({ documentTypeId: event.target.value || null })}
              >
                <option value="">Tất cả loại</option>
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-foreground">Từ ngày</span>
              <input
                type="date"
                className={FIELD_CLASS}
                value={issuedFrom}
                max={issuedTo || undefined}
                onChange={(event) => patchParams({ issuedFrom: event.target.value || null })}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-foreground">Đến ngày</span>
              <input
                type="date"
                className={FIELD_CLASS}
                value={issuedTo}
                min={issuedFrom || undefined}
                onChange={(event) => patchParams({ issuedTo: event.target.value || null })}
              />
            </label>
            <div className="grid gap-1.5 text-sm">
              <span className="font-medium text-foreground">Hướng văn bản</span>
              <div className="flex flex-wrap gap-2">
                {directionOptions.map((option) => (
                  <button
                    key={option.value || "all"}
                    type="button"
                    onClick={() => patchParams({ direction: option.value || null })}
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
            </div>
          </div>

          {hasFilters ? (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <p className="text-sm text-muted-foreground">
                {result ? `Tìm thấy ${result.total} văn bản.` : "Đang tra cứu..."}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                <X className="size-4" />
                Xóa bộ lọc
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

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
          <p className="text-sm text-muted-foreground">
            {hasFilters ? "Không tìm thấy văn bản phù hợp với điều kiện tra cứu." : "Chưa có văn bản nào được công khai."}
          </p>
        ) : (
          <>
            {!hasFilters && result.total > 0 ? (
              <p className="mb-3 text-sm text-muted-foreground">{result.total} văn bản công khai.</p>
            ) : null}
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
                        <p className="mt-1.5 font-medium hover:text-primary">{doc.title}</p>
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
