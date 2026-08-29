import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, PencilLine } from "lucide-react";
import { LEGAL_EDUCATION_PATH, type PublicLegalCampaignListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LegalEducationHubPage() {
  const [items, setItems] = useState<PublicLegalCampaignListItemDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<PublicLegalCampaignListItemDto[]>("/legal-education/campaigns")
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải danh sách đợt phổ biến pháp luật.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        <Link to="/tien-ich-so-cong-doan" className="hover:text-primary">
          Tiện ích số
        </Link>
        {" / "}
        Phổ biến pháp luật
      </p>
      <h1 className="mt-2 text-3xl font-bold">Phổ biến pháp luật</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Tài liệu tóm tắt và văn bản gốc phục vụ phổ biến, giáo dục pháp luật cho đoàn viên. Đọc tài liệu
        không cần đăng nhập; thi trắc nghiệm kiến thức dành cho công đoàn viên đã có tài khoản.
      </p>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : items === null ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có đợt phổ biến pháp luật nào được xuất bản.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <Link key={item.id} to={`${LEGAL_EDUCATION_PATH}/${item.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 py-5">
                    <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <BookOpen className="size-5" />
                    </span>
                    {item.periodLabel ? <Badge variant="outline" className="w-fit">{item.periodLabel}</Badge> : null}
                    <p className="font-medium hover:text-primary">{item.title}</p>
                    {item.summary ? <p className="line-clamp-3 text-sm text-muted-foreground">{item.summary}</p> : null}
                    <div className="mt-auto flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="size-3.5" />
                        {item.materialCount} tài liệu
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <PencilLine className="size-3.5" />
                        {item.examIsOpen ? "Đang mở thi trắc nghiệm" : "Thi trắc nghiệm chưa mở"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
