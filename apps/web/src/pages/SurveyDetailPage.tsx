import { type FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PublicSurveyDetailDto, SubmitSurveyAnswerRequest } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Chi tiết 1 khảo sát + form trả lời — công khai, không cần đăng nhập (khớp
 * PublicSurveysController.submitResponse(), xem ghi chú model Survey trong prisma/schema.prisma). MVP
 * chỉ 2 loại câu hỏi: SINGLE_CHOICE (radio) và TEXT (textarea). */
export function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<PublicSurveyDetailDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadError(null);
    setSurvey(null);

    apiFetch<PublicSurveyDetailDto>(`/surveys/${id}`)
      .then((data) => {
        if (!cancelled) setSurvey(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Không tìm thấy khảo sát này.");
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !survey) return;
    setSubmitError(null);

    for (const question of survey.questions) {
      const value = answers[question.id]?.trim();
      if (question.isRequired && !value) {
        setSubmitError(`Câu hỏi "${question.text}" là bắt buộc, vui lòng trả lời.`);
        return;
      }
    }

    const payloadAnswers: SubmitSurveyAnswerRequest[] = survey.questions
      .map((question) => ({ questionId: question.id, value: (answers[question.id] ?? "").trim() }))
      .filter((a) => a.value !== "");

    setIsSubmitting(true);
    try {
      await apiFetch(`/surveys/${id}/responses`, { method: "POST", body: { answers: payloadAnswers } });
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message.trim() : "";
      setSubmitError(message || "Không thể gửi câu trả lời lúc này, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-destructive">{loadError}</p>
        <Link to="/tien-ich-so-cong-doan/khao-sat" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Quay lại danh sách khảo sát
        </Link>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/tien-ich-so-cong-doan/khao-sat" className="text-sm text-primary hover:underline">
        ← Quay lại danh sách khảo sát
      </Link>

      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{survey.title}</h1>
      {survey.description ? (
        <p className="mt-3 whitespace-pre-line rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          {survey.description}
        </p>
      ) : null}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Trả lời khảo sát</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-sm text-primary">
              Cảm ơn bạn đã dành thời gian trả lời khảo sát này. Ý kiến của bạn đã được ghi nhận.
            </p>
          ) : survey.questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Khảo sát này chưa có câu hỏi nào.</p>
          ) : (
            <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
              {survey.questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <p className="text-sm font-medium">
                    {index + 1}. {question.text}
                    {question.isRequired ? <span className="text-destructive"> *</span> : null}
                  </p>

                  {question.type === "SINGLE_CHOICE" ? (
                    <div className="flex flex-col gap-2">
                      {(question.options ?? []).map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))}
                            className="size-4 accent-primary"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      rows={3}
                      value={answers[question.id] ?? ""}
                      onChange={(event) => setAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))}
                      className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  )}
                </div>
              ))}

              {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Gửi trả lời"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
