import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, Eye, EyeOff, FileText } from "lucide-react";
import type {
  DocumentDirection,
  PaginatedResult,
  PublicOfficialDocumentDetailDto,
  PublicOfficialDocumentListItemDto
} from "@congdoan/types";
import { apiFetch, API_BASE_URL } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DetailSidebar, type DetailSidebarItem } from "@/components/DetailSidebar";

const DIRECTION_LABEL: Record<DocumentDirection, string> = {
  DRAFT: "Dự thảo",
  OUTGOING: "Công văn đi",
  INCOMING: "Công văn đến"
};

/** Đuôi file trình duyệt render trực tiếp được — khớp map "resolveViewableMimeType" phía API (xem
 * apps/api/src/common/utils/mime-type.ts) — giữ đồng bộ khi đổi 1 trong 2 nơi. Đuôi ngoài danh sách
 * này (doc/docx/xls/xlsx/zip...) không hiện nút "Xem", chỉ còn "Tải về" vì trình duyệt không tự mở
 * được các định dạng đó. */
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const INLINE_VIEWABLE_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, "pdf", "txt"]);

function fileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<PublicOfficialDocumentDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otherDocs, setOtherDocs] = useState<PublicOfficialDocumentListItemDto[] | null>(null);
  const [openPreviewId, setOpenPreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(null);
    setDoc(null);
    setOtherDocs(null);
    setOpenPreviewId(null);

    apiFetch<PublicOfficialDocumentDetailDto>(`/official-documents/${id}`)
      .then((data) => {
        if (!cancelled) setDoc(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không tìm thấy văn bản này.");
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;

    // Cột "Văn bản khác" — cùng loại (đi/đến/dự thảo) với văn bản đang xem, để chuyển sang xem văn
    // bản khác mà không phải quay lại trang danh sách. Lấy dư 1 (pageSize+1) vì văn bản đang xem
    // thường nằm trong kết quả (mới nhất) — lọc bỏ theo id rồi cắt về đúng số lượng cần hiển thị.
    const SIDEBAR_COUNT = 6;
    apiFetch<PaginatedResult<PublicOfficialDocumentListItemDto>>(
      `/official-documents?direction=${doc.direction}&pageSize=${SIDEBAR_COUNT + 1}`
    )
      .then((result) => {
        if (cancelled) return;
        setOtherDocs((result.items ?? []).filter((item) => item.id !== doc.id).slice(0, SIDEBAR_COUNT));
      })
      .catch(() => {
        if (!cancelled) setOtherDocs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [doc]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-destructive">{error}</p>
        <Link to="/van-ban" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Quay lại danh sách Văn bản
        </Link>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  const sidebarItems: DetailSidebarItem[] = (otherDocs ?? []).map((item) => ({
    id: item.id,
    href: `/van-ban/${item.id}`,
    title: item.title,
    meta: [item.documentNumber, formatDate(item.issuedAt)].filter(Boolean).join(" — ")
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* 2 cột từ lg trở lên — cột phải liệt kê văn bản cùng loại (đi/đến/dự thảo) để bấm chuyển xem
       * ngay, không phải quay lại trang danh sách rồi lọc lại. */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Link to="/van-ban" className="text-sm text-primary hover:underline">
            ← Quay lại danh sách Văn bản
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{DIRECTION_LABEL[doc.direction]}</Badge>
            <Badge variant="secondary">{doc.documentType.name}</Badge>
          </div>

          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{doc.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {doc.documentNumber ? `Số hiệu: ${doc.documentNumber} — ` : ""}
            {doc.issuingOfficeName ? `${doc.issuingOfficeName} — ` : ""}
            Ngày ban hành: {formatDate(doc.issuedAt)}
          </p>

          {doc.coverImageUrl ? (
            <img
              src={doc.coverImageUrl}
              alt={doc.title}
              className="mt-6 aspect-video w-full rounded-xl object-cover"
            />
          ) : null}

          {doc.summary ? (
            <p className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">{doc.summary}</p>
          ) : null}

          {doc.content ? (
            <div
              className={[
                "mt-6 max-w-none text-base leading-relaxed text-foreground",
                "[&_p]:my-4",
                "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold",
                "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold",
                "[&_a]:text-primary [&_a]:underline",
                "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
                "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
                "[&_img]:my-4 [&_img]:rounded-lg",
                "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
              ].join(" ")}
              // Nội dung do người có quyền document:* nhập/ETL — render HTML giống NewsDetailPage.
              dangerouslySetInnerHTML={{ __html: doc.content }}
            />
          ) : null}

          {doc.attachments.length > 0 ? (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <h2 className="mb-3 text-sm font-semibold">File đính kèm</h2>
                <ul className="flex flex-col gap-3">
                  {doc.attachments.map((attachment) => {
                    const ext = fileExtension(attachment.fileName);
                    const canPreviewInline = INLINE_VIEWABLE_EXTENSIONS.has(ext);
                    const isOpen = openPreviewId === attachment.id;
                    const viewUrl = `${API_BASE_URL}/official-documents/${doc.id}/attachments/${attachment.id}/view`;

                    return (
                      <li key={attachment.id} className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm">
                          <FileText className="size-4 shrink-0 text-primary" />
                          <span className="min-w-0 flex-1 truncate">{attachment.fileName}</span>
                          {canPreviewInline ? (
                            <button
                              type="button"
                              onClick={() => setOpenPreviewId(isOpen ? null : attachment.id)}
                              className="flex shrink-0 items-center gap-1 text-primary hover:underline"
                            >
                              {isOpen ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                              {isOpen ? "Ẩn" : "Xem"}
                            </button>
                          ) : null}
                          <a
                            href={`${API_BASE_URL}/official-documents/${doc.id}/attachments/${attachment.id}/download`}
                            className="flex shrink-0 items-center gap-1 text-muted-foreground hover:text-primary"
                          >
                            <Download className="size-4" />
                            Tải về
                          </a>
                        </div>

                        {isOpen ? (
                          IMAGE_EXTENSIONS.has(ext) ? (
                            <img
                              src={viewUrl}
                              alt={attachment.fileName}
                              className="max-h-[600px] w-full rounded-lg border bg-muted/30 object-contain"
                            />
                          ) : (
                            <iframe
                              src={viewUrl}
                              title={attachment.fileName}
                              className="h-[600px] w-full rounded-lg border"
                            />
                          )
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Button asChild variant="outline" className="mt-8">
            <Link to="/van-ban">← Quay lại danh sách Văn bản</Link>
          </Button>
        </div>

        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <DetailSidebar
              title="Văn bản khác"
              items={sidebarItems}
              isLoading={otherDocs === null}
              viewAllHref={`/van-ban?direction=${doc.direction}`}
              viewAllLabel="Xem tất cả"
              emptyLabel="Chưa có văn bản khác cùng loại."
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
