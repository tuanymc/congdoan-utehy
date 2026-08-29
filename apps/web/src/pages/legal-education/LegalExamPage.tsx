import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LEGAL_EDUCATION_PATH, type LegalExamAttemptDto, type LegalExamSubmitResultDto, type PublicLegalCampaignDetailDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function LegalExamPage() {
  const { slug } = useParams<{ slug: string }>();
  const [attempt, setAttempt] = useState<LegalExamAttemptDto | null>(null);
  const [result, setResult] = useState<LegalExamSubmitResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [remainingMs, setRemainingMs] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const answersRef = useRef(answers);
  const attemptRef = useRef(attempt);
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    apiFetch<PublicLegalCampaignDetailDto>(`/legal-education/campaigns/${slug}`)
      .then(async (campaign) => {
        if (!campaign.exam) throw new Error("Đợt này chưa có bài thi.");
        const started = await apiFetch<LegalExamAttemptDto>(`/legal-education/exams/${campaign.exam.id}/attempts`, {
          method: "POST"
        });
        if (cancelled) return;
        setAttempt(started);
        const initial: Record<string, number | null> = {};
        for (const q of started.questions) initial[q.id] = null;
        for (const a of started.answers) initial[a.questionId] = a.selectedOptionIndex;
        setAnswers(initial);
        setRemainingMs(new Date(started.expiresAt).getTime() - Date.now());
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Không thể bắt đầu bài thi.");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const submit = useCallback(async () => {
    const current = attemptRef.current;
    if (!current || submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answersRef.current).map(([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex
        }))
      };
      const data = await apiFetch<LegalExamSubmitResultDto>(
        `/legal-education/exams/${current.examId}/attempts/${current.id}/submit`,
        { method: "POST", body: payload }
      );
      setResult(data);
    } catch (err) {
      submittedRef.current = false;
      setError(err instanceof ApiError ? err.message : "Không thể nộp bài, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    if (!attempt || result) return;
    const timer = window.setInterval(() => {
      const left = new Date(attempt.expiresAt).getTime() - Date.now();
      setRemainingMs(left);
      if (left <= 0) void submit();
    }, 500);
    return () => window.clearInterval(timer);
  }, [attempt, result, submit]);

  useEffect(() => {
    if (!attempt || result) return;
    const handle = window.setTimeout(() => {
      void apiFetch(`/legal-education/exams/${attempt.examId}/attempts/${attempt.id}`, {
        method: "PATCH",
        body: {
          answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
            questionId,
            selectedOptionIndex
          }))
        }
      }).catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(handle);
  }, [answers, attempt, result]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => v !== null && v !== undefined).length,
    [answers]
  );

  if (error && !attempt && !result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-destructive">{error}</p>
        <Link to={slug ? `${LEGAL_EDUCATION_PATH}/${slug}` : LEGAL_EDUCATION_PATH} className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Quay lại đợt phổ biến
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm font-medium text-primary">Kết quả bài thi</p>
            <h1 className="mt-2 text-3xl font-bold">{result.passed ? "Đạt" : "Không đạt"}</h1>
            <p className="mt-3 text-muted-foreground">
              Đồng chí trả lời đúng {result.score}/{result.total} câu ({Math.round((result.score / Math.max(result.total, 1)) * 100)}%).
              Điểm đạt từ {result.passingScorePercent}%.
            </p>
            {result.status === "EXPIRED" ? (
              <p className="mt-2 text-sm text-muted-foreground">Bài thi đã hết giờ và được nộp tự động.</p>
            ) : null}
            <Button className="mt-6" asChild>
              <Link to={slug ? `${LEGAL_EDUCATION_PATH}/${slug}` : LEGAL_EDUCATION_PATH}>Quay lại tài liệu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  const question = attempt.questions[currentIndex];
  const urgent = remainingMs <= 60_000;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`${LEGAL_EDUCATION_PATH}/${slug}`} className="text-sm text-primary hover:underline">
          ← Tài liệu phổ biến
        </Link>
        <p className={`rounded-md px-3 py-1 text-sm font-semibold ${urgent ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>
          Còn lại {formatCountdown(remainingMs)}
        </p>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Đã trả lời {answeredCount}/{attempt.questions.length} câu
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {attempt.questions.map((q, index) => {
          const selected = answers[q.id] !== null && answers[q.id] !== undefined;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`size-8 rounded-md text-xs font-medium ${
                index === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : selected
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {question ? (
        <Card className="mt-6">
          <CardContent className="py-6">
            <p className="text-sm font-medium text-muted-foreground">Câu {currentIndex + 1}</p>
            <h2 className="mt-1 text-lg font-semibold">{question.text}</h2>
            <div className="mt-4 flex flex-col gap-2">
              {question.options.map((option, displayIndex) => {
                const originalIndex = question.originalIndices[displayIndex] ?? displayIndex;
                const checked = answers[question.id] === originalIndex;
                return (
                  <label
                    key={`${question.id}-${originalIndex}`}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-sm ${checked ? "border-primary bg-primary/5" : ""}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      className="mt-0.5"
                      checked={checked}
                      onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: originalIndex }))}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-6 flex flex-wrap justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        >
          Câu trước
        </Button>
        {currentIndex < attempt.questions.length - 1 ? (
          <Button type="button" onClick={() => setCurrentIndex((i) => i + 1)}>
            Câu tiếp
          </Button>
        ) : (
          <Button type="button" disabled={isSubmitting} onClick={() => void submit()}>
            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
          </Button>
        )}
      </div>
    </div>
  );
}
