import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, FileText, Search } from "lucide-react";
import type { PaginatedResult, PublicOfficialDocumentListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 12;

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** "Kho biểu mẫu" — Tiện ích số Công đoàn (Phase 4a). Tái dùng nguyên hệ Công văn (OfficialDocument/
 * DocumentAttachment) với 1 DocumentType riêng "Biểu mẫu Công đoàn" (xem seed.ts) thay vì xây model
 * mới — đúng những gì web cũ gọi là "Quy trình, Biểu mẫu" (trỏ /van-ban, trang tải file tĩnh) nhưng đã
 * chủ động bỏ qua lúc ETL vì chưa có nội dung tương ứng. Bấm vào 1 biểu mẫu sẽ mở trang chi tiết công
 * văn có sẵn (/van-ban/:id) để xem/tải file đính kèm — không tự vẽ lại UI xem/tải file ở đây. */
export function DigitalFormsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const [result, setResult] = useState<PaginatedResult<PublicOfficialDocumentListItemDto> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      setSearchParams(params, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi searchInput đổi (debounce), giống UnionMembersPage.tsx.
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setResult(null);

    const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    const search = searchParams.get("search") ?? "";
    if (search) query.set("search", search);

    apiFetch<PaginatedResult<PublicOfficialDocumentListItemDto>>(`/official-documents/forms?${query.toString()}`)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải danh sách biểu mẫu.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams đọc trực tiếp field "search", không cần liệt kê cả object.
  }, [page, searchParams.get("search")]);

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Kho biểu mẫu</h1>
      <p className="mt-2 text-muted-foreground">
        Các biểu mẫu, đơn từ dùng chung cho đoàn viên Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên — bấm vào để xem và tải xuống.
      </p>

      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Tìm biểu mẫu theo tên..."
          className="w-full rounded-md border bg-input-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : result === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : result.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {searchParams.get("search") ? "Không tìm thấy biểu mẫu phù hợp." : "Chưa có biểu mẫu nào được công khai."}
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((form) => (
                <Link key={form.id} to={`/van-ban/${form.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full flex-col gap-3 py-5">
                      {form.coverImageUrl ? (
                        <img
                          src={form.coverImageUrl}
                          alt=""
                          className="aspect-video w-full rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <FileText className="size-5" />
                        </span>
                      )}
                      <div className="flex-1">
                        <p className="font-medium hover:text-primary">{form.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Cập nhật: {formatDate(form.issuedAt)}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        <Download className="size-4" />
                        Xem & tải xuống
                      </span>
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
