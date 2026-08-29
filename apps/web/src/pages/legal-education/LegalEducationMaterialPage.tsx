import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download } from "lucide-react";
import { LEGAL_EDUCATION_PATH, type PublicLegalMaterialDetailDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CONTENT_CLASS = [
  "mt-8 max-w-none text-base leading-relaxed text-foreground",
  "[&_p]:my-4",
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold",
  "[&_a]:text-primary [&_a]:underline",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
  "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6"
].join(" ");

export function LegalEducationMaterialPage() {
  const { slug, materialSlug } = useParams<{ slug: string; materialSlug: string }>();
  const [item, setItem] = useState<PublicLegalMaterialDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !materialSlug) return;
    let cancelled = false;
    setError(null);
    setItem(null);
    apiFetch<PublicLegalMaterialDetailDto>(`/legal-education/campaigns/${slug}/materials/${materialSlug}`)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Không tìm thấy tài liệu này.");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, materialSlug]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-destructive">{error}</p>
        <Link to={slug ? `${LEGAL_EDUCATION_PATH}/${slug}` : LEGAL_EDUCATION_PATH} className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Quay lại
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        <Link to={LEGAL_EDUCATION_PATH} className="hover:text-primary">
          Phổ biến pháp luật
        </Link>
        {" / "}
        <Link to={`${LEGAL_EDUCATION_PATH}/${item.campaignSlug}`} className="hover:text-primary">
          {item.campaignTitle}
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold">{item.title}</h1>
      {item.excerpt ? <p className="mt-3 text-muted-foreground">{item.excerpt}</p> : null}
      {item.fileUrl ? (
        <Button className="mt-4" variant="outline" asChild>
          <a href={item.fileUrl} target="_blank" rel="noreferrer">
            <Download className="size-4" />
            Tải văn bản gốc (PDF)
          </a>
        </Button>
      ) : null}
      <div className={CONTENT_CLASS} dangerouslySetInnerHTML={{ __html: item.content }} />
    </div>
  );
}
