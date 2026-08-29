import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Download } from "lucide-react";
import type { LegalEducationCampaignDetailDto, LegalExamResultsDto } from "@congdoan/types";
import { apiFetch, apiFetchBlob, ApiError } from "../../lib/api-client";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

function statusLabel(status: string): string {
  if (status === "SUBMITTED") return "Đã nộp";
  if (status === "EXPIRED") return "Hết giờ";
  return "Đang làm";
}

export function LegalEducationResultsPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaignResult, isLoading: campaignLoading } = useOne<LegalEducationCampaignDetailDto>({
    resource: "legal-education-campaigns",
    id: campaignId,
    queryOptions: { enabled: Boolean(campaignId) }
  });
  const examId = campaignResult?.data?.exam?.id;

  const [results, setResults] = useState<LegalExamResultsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!examId) return;
    let cancelled = false;
    setError(null);
    apiFetch<LegalExamResultsDto>(`/admin/legal-education/exams/${examId}/results`)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Không thể tải kết quả.");
      });
    return () => {
      cancelled = true;
    };
  }, [examId]);

  async function handleExport() {
    if (!examId) return;
    setIsExporting(true);
    try {
      const { blob, fileName } = await apiFetchBlob(`/admin/legal-education/exams/${examId}/results.csv`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate("/legal-education-campaigns")}>
          <ArrowLeft className="size-4" />
          Quay lại danh sách
        </Button>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold">Kết quả — {results?.examTitle ?? campaignResult?.data?.title ?? "Đang tải..."}</h1>
            {results ? (
              <p className="text-muted-foreground">
                {results.submittedCount} lượt đã nộp · {results.passedCount} đạt · điểm đạt từ {results.passingScorePercent}%
              </p>
            ) : null}
          </div>
          <Button variant="outline" disabled={!examId || isExporting} onClick={() => void handleExport()}>
            <Download className="size-4" />
            {isExporting ? "Đang tải..." : "Xuất CSV"}
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mã cán bộ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Nộp bài</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(campaignLoading || (examId && !results && !error)) &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {results && results.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Chưa có lượt thi nào.
                </TableCell>
              </TableRow>
            )}

            {results?.rows.map((row) => (
              <TableRow key={row.attemptId}>
                <TableCell className="font-medium">{row.fullName}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.staffCode ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{statusLabel(row.status)}</Badge>
                </TableCell>
                <TableCell>{row.score === null ? "—" : `${row.score}/${row.total}`}</TableCell>
                <TableCell>
                  {row.passed === null ? "—" : <Badge variant={row.passed ? "default" : "secondary"}>{row.passed ? "Đạt" : "Không đạt"}</Badge>}
                </TableCell>
                <TableCell>{row.submittedAt ? new Date(row.submittedAt).toLocaleString("vi-VN") : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
