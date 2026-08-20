import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import type { PublicSurveyListItemDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDeadline(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** "Khảo sát ý kiến" — Tiện ích số Công đoàn (Phase 4d). Danh sách công khai các khảo sát isOpen=true
 * (khớp SurveysService.listPublic) — không cần đăng nhập để trả lời, theo đúng chính sách áp dụng
 * chung cho các form công khai trong Tiện ích số (xem ghi chú model Survey, prisma/schema.prisma). */
export function SurveysPage() {
  const [items, setItems] = useState<PublicSurveyListItemDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setItems(null);

    apiFetch<PublicSurveyListItemDto[]>("/surveys")
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Không thể tải danh sách khảo sát.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Khảo sát ý kiến</h1>
      <p className="mt-2 text-muted-foreground">
        Góp ý, khảo sát ý kiến đoàn viên về các chủ trương, hoạt động của Công đoàn Trường Đại học Sư phạm Kỹ
        thuật Hưng Yên.
      </p>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : items === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hiện chưa có khảo sát nào đang mở.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((survey) => {
              const deadline = formatDeadline(survey.endAt);
              return (
                <Link key={survey.id} to={`/tien-ich-so-cong-doan/khao-sat/${survey.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full flex-col gap-3 py-5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <ClipboardList className="size-5" />
                      </span>
                      <div className="flex-1">
                        <p className="font-medium hover:text-primary">{survey.title}</p>
                        {survey.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{survey.description}</p>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {survey.questionCount} câu hỏi{deadline ? ` — hạn trả lời: ${deadline}` : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
