import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, FileText, PencilLine } from "lucide-react";
import { LEGAL_EDUCATION_PATH, type PublicLegalCampaignDetailDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LegalEducationCampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [item, setItem] = useState<PublicLegalCampaignDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setError(null);
    setItem(null);
    apiFetch<PublicLegalCampaignDetailDto>(`/legal-education/campaigns/${slug}`)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Không tìm thấy đợt phổ biến pháp luật này.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-destructive">{error}</p>
        <Link to={LEGAL_EDUCATION_PATH} className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Quay lại Phổ biến pháp luật
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

  const examHref = `${LEGAL_EDUCATION_PATH}/${item.slug}/thi`;
  const practiceHref = `${LEGAL_EDUCATION_PATH}/${item.slug}/thi-thu`;

  function formatWindow(start: string | null | undefined, end: string | null | undefined): string | null {
    if (!start && !end) return null;
    const fmt = (iso: string) => new Date(iso).toLocaleString("vi-VN");
    if (start && end) return `${fmt(start)} – ${fmt(end)}`;
    if (start) return `từ ${fmt(start)}`;
    return `đến ${fmt(end!)}`;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-muted-foreground">
        <Link to="/tien-ich-so-cong-doan" className="hover:text-primary">
          Tiện ích số
        </Link>
        {" / "}
        <Link to={LEGAL_EDUCATION_PATH} className="hover:text-primary">
          Phổ biến pháp luật
        </Link>
      </p>
      {item.periodLabel ? <Badge variant="outline" className="mt-3">{item.periodLabel}</Badge> : null}
      <h1 className="mt-2 text-3xl font-bold">{item.title}</h1>
      {item.summary ? <p className="mt-3 text-muted-foreground">{item.summary}</p> : null}

      <h2 className="mt-10 text-xl font-semibold">Tài liệu phổ biến</h2>
      <div className="mt-4 flex flex-col gap-3">
        {item.materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có tài liệu trong đợt này.</p>
        ) : (
          item.materials.map((material) => (
            <Card key={material.id}>
              <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    to={`${LEGAL_EDUCATION_PATH}/${item.slug}/${material.slug}`}
                    className="font-medium hover:text-primary"
                  >
                    {material.title}
                  </Link>
                  {material.excerpt ? <p className="mt-1 text-sm text-muted-foreground">{material.excerpt}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`${LEGAL_EDUCATION_PATH}/${item.slug}/${material.slug}`}>
                      <FileText className="size-4" />
                      Đọc tóm tắt
                    </Link>
                  </Button>
                  {material.fileUrl ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={material.fileUrl} target="_blank" rel="noreferrer">
                        <Download className="size-4" />
                        Tải PDF
                      </a>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {item.exam ? (
        <Card className="mt-10">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <PencilLine className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{item.exam.title}</h2>
                {item.exam.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{item.exam.description}</p>
                ) : null}
                <p className="mt-2 text-sm text-muted-foreground">
                  Mỗi đề {item.exam.questionCount} câu
                  {item.exam.questionBankCount > item.exam.questionCount
                    ? ` (lấy ngẫu nhiên từ ngân hàng ${item.exam.questionBankCount} câu)`
                    : ""}
                  , trộn thứ tự câu và đáp án · {item.exam.durationMinutes} phút · đạt từ {item.exam.passingScorePercent}% · tối đa{" "}
                  {item.exam.maxAttempts} lần thi chính thức. Dành cho công đoàn viên đã đăng nhập.
                </p>
                {formatWindow(item.exam.practiceStartAt, item.exam.practiceEndAt) ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thi thử: {formatWindow(item.exam.practiceStartAt, item.exam.practiceEndAt)}
                    {item.exam.practiceIsOpen ? " — đang mở." : "."}
                  </p>
                ) : null}
                {formatWindow(item.exam.startAt, item.exam.endAt) ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Thi chính thức: {formatWindow(item.exam.startAt, item.exam.endAt)}
                    {item.exam.isOpen ? " — đang mở." : "."}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.exam.practiceIsOpen ? (
                    <Button variant="outline" asChild>
                      <Link
                        to={isAuthenticated ? practiceHref : "/dang-nhap"}
                        state={isAuthenticated ? undefined : { from: { pathname: practiceHref } }}
                      >
                        {isAuthenticated ? "Thi thử" : "Đăng nhập để thi thử"}
                      </Link>
                    </Button>
                  ) : null}
                  {item.exam.isOpen ? (
                    <Button asChild>
                      <Link to={isAuthenticated ? examHref : "/dang-nhap"} state={isAuthenticated ? undefined : { from: { pathname: examHref } }}>
                        {isAuthenticated ? "Thi chính thức" : "Đăng nhập để thi chính thức"}
                      </Link>
                    </Button>
                  ) : null}
                </div>
                {!item.exam.isOpen && !item.exam.practiceIsOpen ? (
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    Bài thi chưa mở. Vui lòng đọc tài liệu và chờ Công đoàn thông báo lịch thi thử / thi chính thức.
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
