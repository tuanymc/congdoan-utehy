import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, FileText } from "lucide-react";
import type { DocumentDirection, PublicOfficialDocumentDetailDto } from "@congdoan/types";
import { apiFetch, API_BASE_URL } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const DIRECTION_LABEL: Record<DocumentDirection, string> = {
  DRAFT: "Dự thảo",
  OUTGOING: "Công văn đi",
  INCOMING: "Công văn đến"
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<PublicOfficialDocumentDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(null);
    setDoc(null);

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
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

      {doc.summary ? (
        <p className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">{doc.summary}</p>
      ) : null}

      {doc.content ? (
        <div
          className="prose prose-sm mt-6 max-w-none text-foreground"
          // Nội dung công văn do người có quyền "document:*" nhập/ETL từ web cũ, không nhận input trực
          // tiếp từ khách truy cập trang này — an toàn để render HTML trực tiếp (giống NewsDetailPage).
          dangerouslySetInnerHTML={{ __html: doc.content }}
        />
      ) : null}

      {doc.attachments.length > 0 ? (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h2 className="mb-3 text-sm font-semibold">File đính kèm</h2>
            <ul className="flex flex-col gap-2">
              {doc.attachments.map((attachment) => (
                <li key={attachment.id}>
                  <a
                    href={`${API_BASE_URL}/official-documents/${doc.id}/attachments/${attachment.id}/download`}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
                  >
                    <FileText className="size-4 shrink-0 text-primary" />
                    <span className="flex-1 truncate">{attachment.fileName}</span>
                    <Download className="size-4 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Button asChild variant="outline" className="mt-8">
        <Link to="/van-ban">← Quay lại danh sách Văn bản</Link>
      </Button>
    </div>
  );
}
