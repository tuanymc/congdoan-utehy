import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { SurveyResultsDto } from "@congdoan/types";
import { apiFetch, ApiError } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

/** Trang xem kết quả tổng hợp 1 khảo sát. Câu trắc nghiệm (SINGLE_CHOICE) hiển thị dạng thanh ngang
 * (1 màu duy nhất — bg-primary, đúng vì đây là biểu đồ 1-chuỗi-dữ-liệu-so-sánh-độ-lớn giữa các lựa
 * chọn TRONG CÙNG 1 câu hỏi, không phải nhiều chuỗi cần phân biệt màu — không cần chú giải/legend
 * riêng, đầu thanh bo tròn, có nhãn giá trị trực tiếp thay vì trục số). Câu tự luận (TEXT) liệt kê
 * từng câu trả lời dạng thẻ. Không dùng thư viện biểu đồ ngoài (tránh thêm dependency mới) — thanh
 * ngang CSS đơn giản là đủ cho quy mô dữ liệu này. */
export function SurveyResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [results, setResults] = useState<SurveyResultsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(null);
    setResults(null);

    apiFetch<SurveyResultsDto>(`/admin/surveys/${id}/results`)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Không thể tải kết quả khảo sát.");
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate("/surveys")}>
          <ArrowLeft className="size-4" />
          Quay lại danh sách khảo sát
        </Button>
        <h1 className="text-2xl font-semibold">Kết quả — {results?.title ?? "Đang tải..."}</h1>
        {results ? <p className="text-muted-foreground">Tổng cộng {results.responseCount} lượt trả lời.</p> : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!error && !results ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : null}

      {results?.questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Khảo sát này chưa có câu hỏi nào.</p>
      ) : null}

      {results?.responseCount === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có lượt trả lời nào cho khảo sát này.</p>
      ) : null}

      {results?.questions.map((q) => {
        const totalForQuestion = q.optionCounts?.reduce((sum, o) => sum + o.count, 0) ?? 0;
        return (
          <Card key={q.questionId}>
            <CardContent className="flex flex-col gap-4 py-5">
              <p className="font-medium">{q.text}</p>

              {q.optionCounts ? (
                totalForQuestion === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có câu trả lời cho câu hỏi này.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {q.optionCounts.map((o) => {
                      const percent = totalForQuestion > 0 ? Math.round((o.count / totalForQuestion) * 100) : 0;
                      return (
                        <div key={o.option} className="flex flex-col gap-1">
                          <div className="flex items-baseline justify-between gap-2 text-sm">
                            <span className="min-w-0 truncate">{o.option}</span>
                            <span className="shrink-0 text-muted-foreground">
                              {o.count} ({percent}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={`${o.option}: ${o.count} lượt chọn, ${percent}%`}>
                            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : null}

              {q.textAnswers ? (
                q.textAnswers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có câu trả lời cho câu hỏi này.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {q.textAnswers.map((answer, index) => (
                      <div key={index} className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        {answer}
                      </div>
                    ))}
                  </div>
                )
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
