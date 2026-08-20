import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HandHeart } from "lucide-react";
import { PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS } from "@congdoan/types";
import type { PublicServiceProcedureDetailDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PUBLIC_SERVICE_CATEGORY_ICONS } from "./category-icons";

/** Mẫu 8 phần cố định (nhóm 2) — CHỈ hiện phần nào có nội dung (xem PublicServiceProcedureForm.tsx phía
 * quản trị, các trường đều optional). */
const GUIDE_SECTIONS: { key: keyof PublicServiceProcedureDetailDto; label: string }[] = [
  { key: "conditions", label: "Điều kiện" },
  { key: "requiredDocuments", label: "Hồ sơ cần chuẩn bị" },
  { key: "whereToApply", label: "Nơi thực hiện" },
  { key: "steps", label: "Các bước thao tác" },
  { key: "fee", label: "Phí/lệ phí" },
  { key: "processingTime", label: "Thời hạn" },
  { key: "resultDelivery", label: "Cách nhận kết quả" },
  { key: "commonMistakes", label: "Lỗi thường gặp" }
];

export function PublicServiceProcedureDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<PublicServiceProcedureDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setError(null);
    setItem(null);

    apiFetch<PublicServiceProcedureDetailDto>(`/public-service-procedures/${slug}`)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Không tìm thấy thủ tục này.");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-destructive">{error}</p>
        <Link to="/tien-ich-so-cong-doan/dich-vu-cong/thu-tuc" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Quay lại Tra cứu nhanh dịch vụ công
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  const Icon = PUBLIC_SERVICE_CATEGORY_ICONS[item.category];
  const visibleSections = GUIDE_SECTIONS.filter((section) => Boolean(item[section.key]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/tien-ich-so-cong-doan/dich-vu-cong/thu-tuc" className="text-sm text-primary hover:underline">
        ← Quay lại Tra cứu nhanh dịch vụ công
      </Link>

      <div className="mt-4 flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-6" />
        </span>
        <div>
          <Badge variant="outline">{PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS[item.category]}</Badge>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{item.title}</h1>
          {item.summary ? <p className="mt-1 text-muted-foreground">{item.summary}</p> : null}
        </div>
      </div>

      {visibleSections.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Công đoàn đang cập nhật hướng dẫn chi tiết cho thủ tục này.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {visibleSections.map((section, index) => (
            <Card key={section.key}>
              <CardHeader>
                <CardTitle className="text-base">
                  {index + 1}. {section.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{item[section.key]}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-8 border-primary/40 bg-primary/5">
        <CardContent className="flex flex-col items-start gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HandHeart className="size-5" />
            </span>
            <p className="text-sm">Vẫn còn vướng mắc với thủ tục này? Gửi yêu cầu để Công đoàn hỗ trợ trực tiếp.</p>
          </div>
          <Button asChild>
            <Link to={`/tien-ich-so-cong-doan/dich-vu-cong/ho-tro?procedureId=${item.id}`}>Công đoàn hỗ trợ tôi</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
