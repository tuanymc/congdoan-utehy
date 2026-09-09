import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { LEGAL_EXAM_UNIT_SCORE_WEIGHTS, type LegalEducationCampaignDetailDto, type LegalExamResultsDto } from "@congdoan/types";
import { apiFetch, apiFetchBlob, ApiError } from "../../lib/api-client";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";
import { pushToast } from "../../components/common/toast-store";

type ResultTab = "individuals" | "units" | "attempts";
type DeleteTarget =
  | { kind: "participant"; userId: string; fullName: string }
  | { kind: "attempt"; attemptId: string; fullName: string };

function statusLabel(status: string): string {
  if (status === "SUBMITTED") return "Đã nộp";
  if (status === "EXPIRED") return "Hết giờ";
  return "Đang làm";
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}%`;
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
  const [isExporting, setIsExporting] = useState<"individuals" | "units" | null>(null);
  const [tab, setTab] = useState<ResultTab>("individuals");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadResults = useCallback(async () => {
    if (!examId) return;
    const data = await apiFetch<LegalExamResultsDto>(`/admin/legal-education/exams/${examId}/results`);
    setResults(data);
  }, [examId]);

  useEffect(() => {
    if (!examId) return;
    let cancelled = false;
    setError(null);
    loadResults().catch((err: unknown) => {
      if (!cancelled) setError(err instanceof ApiError ? err.message : "Không thể tải kết quả.");
    });
    return () => {
      cancelled = true;
    };
  }, [examId, loadResults]);

  async function handleExport(kind: "individuals" | "units") {
    if (!examId) return;
    setIsExporting(kind);
    try {
      const path =
        kind === "units"
          ? `/admin/legal-education/exams/${examId}/results-units.csv`
          : `/admin/legal-education/exams/${examId}/results.csv`;
      const { blob, fileName } = await apiFetchBlob(path);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(null);
    }
  }

  async function handleConfirmDelete() {
    if (!examId || !deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === "participant") {
        await apiFetch(`/admin/legal-education/exams/${examId}/participants/${deleteTarget.userId}/attempts`, {
          method: "DELETE"
        });
        pushToast({ variant: "success", message: `Đã xoá kết quả của ${deleteTarget.fullName}.` });
      } else {
        await apiFetch(`/admin/legal-education/exams/${examId}/attempts/${deleteTarget.attemptId}`, {
          method: "DELETE"
        });
        pushToast({ variant: "success", message: `Đã xoá lượt thi của ${deleteTarget.fullName}.` });
      }
      setDeleteTarget(null);
      await loadResults();
    } catch (err: unknown) {
      pushToast({
        variant: "error",
        message: "Không xoá được kết quả",
        description: err instanceof ApiError ? err.message : "Vui lòng thử lại sau."
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const loading = campaignLoading || (Boolean(examId) && !results && !error);

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
                {results.officialSubmittedCount} đoàn viên đã nộp chính thức · {results.officialPassedCount} đạt · điểm đạt từ{" "}
                {results.passingScorePercent}% · {results.units.length} công đoàn bộ phận
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={!examId || isExporting !== null} onClick={() => void handleExport("individuals")}>
              <Download className="size-4" />
              {isExporting === "individuals" ? "Đang tải..." : "CSV cá nhân"}
            </Button>
            <Button variant="outline" disabled={!examId || isExporting !== null} onClick={() => void handleExport("units")}>
              <Download className="size-4" />
              {isExporting === "units" ? "Đang tải..." : "CSV đơn vị"}
            </Button>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <p className="text-xs text-muted-foreground">
        Điểm đơn vị = {LEGAL_EXAM_UNIT_SCORE_WEIGHTS.averagePercent * 100}% điểm trung bình cá nhân +{" "}
        {LEGAL_EXAM_UNIT_SCORE_WEIGHTS.participationPercent * 100}% tỷ lệ tham gia + {LEGAL_EXAM_UNIT_SCORE_WEIGHTS.passPercent * 100}% tỷ lệ
        đạt. Chỉ tính lượt thi chính thức tốt nhất của mỗi người. Thi thử không cộng điểm. Xoá kết quả để đoàn viên thi lại từ đầu.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === "individuals" ? "default" : "outline"} size="sm" onClick={() => setTab("individuals")}>
          Xếp hạng cá nhân
        </Button>
        <Button variant={tab === "units" ? "default" : "outline"} size="sm" onClick={() => setTab("units")}>
          Công đoàn bộ phận
        </Button>
        <Button variant={tab === "attempts" ? "default" : "outline"} size="sm" onClick={() => setTab("attempts")}>
          Tất cả lượt thi
        </Button>
      </div>

      {tab === "individuals" ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hạng</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Công đoàn bộ phận</TableHead>
                <TableHead>Mã cán bộ</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead>Nộp bài</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {results && results.individuals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Chưa có lượt thi chính thức nào.
                  </TableCell>
                </TableRow>
              ) : null}
              {results?.individuals.map((row) => (
                <TableRow key={row.attemptId}>
                  <TableCell className="font-medium">{row.rank}</TableCell>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.departmentName ?? "Chưa gắn bộ phận"}</TableCell>
                  <TableCell>{row.staffCode ?? "—"}</TableCell>
                  <TableCell>{row.score === null ? "—" : `${row.score}/${row.total}`}</TableCell>
                  <TableCell>{formatPercent(row.percent)}</TableCell>
                  <TableCell>
                    {row.passed === null ? "—" : <Badge variant={row.passed ? "default" : "secondary"}>{row.passed ? "Đạt" : "Không đạt"}</Badge>}
                  </TableCell>
                  <TableCell>{row.submittedAt ? new Date(row.submittedAt).toLocaleString("vi-VN") : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget({ kind: "participant", userId: row.userId, fullName: row.fullName })}
                    >
                      <Trash2 className="size-4" />
                      Xoá kết quả
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {tab === "units" ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hạng</TableHead>
                <TableHead>Công đoàn bộ phận</TableHead>
                <TableHead>Có tài khoản</TableHead>
                <TableHead>Đã nộp</TableHead>
                <TableHead>Đạt</TableHead>
                <TableHead>Tham gia</TableHead>
                <TableHead>Điểm TB</TableHead>
                <TableHead>Tỷ lệ đạt</TableHead>
                <TableHead>Điểm đơn vị</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`unit-skeleton-${index}`}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {results && results.units.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Chưa có công đoàn bộ phận nào có đoàn viên gắn tài khoản.
                  </TableCell>
                </TableRow>
              ) : null}
              {results?.units.map((unit) => (
                <TableRow key={unit.departmentId}>
                  <TableCell className="font-medium">{unit.rank}</TableCell>
                  <TableCell>{unit.departmentName}</TableCell>
                  <TableCell>{unit.eligibleCount}</TableCell>
                  <TableCell>{unit.submittedCount}</TableCell>
                  <TableCell>{unit.passedCount}</TableCell>
                  <TableCell>{formatPercent(unit.participationPercent)}</TableCell>
                  <TableCell>{formatPercent(unit.averagePercent)}</TableCell>
                  <TableCell>{formatPercent(unit.passPercent)}</TableCell>
                  <TableCell className="font-semibold">{unit.unitScore.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {tab === "attempts" ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Bộ phận</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead>Nộp bài</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`attempt-skeleton-${index}`}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {results && results.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Chưa có lượt thi nào.
                  </TableCell>
                </TableRow>
              ) : null}
              {results?.rows.map((row) => (
                <TableRow key={row.attemptId}>
                  <TableCell className="font-medium">{row.fullName}</TableCell>
                  <TableCell>{row.departmentName ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={row.isPractice ? "secondary" : "outline"}>{row.isPractice ? "Thi thử" : "Chính thức"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{statusLabel(row.status)}</Badge>
                  </TableCell>
                  <TableCell>{row.score === null ? "—" : `${row.score}/${row.total}`}</TableCell>
                  <TableCell>
                    {row.passed === null ? "—" : <Badge variant={row.passed ? "default" : "secondary"}>{row.passed ? "Đạt" : "Không đạt"}</Badge>}
                  </TableCell>
                  <TableCell>{row.submittedAt ? new Date(row.submittedAt).toLocaleString("vi-VN") : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget({ kind: "attempt", attemptId: row.attemptId, fullName: row.fullName })}
                    >
                      <Trash2 className="size-4" />
                      Xoá
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title={deleteTarget?.kind === "participant" ? "Xoá kết quả thí sinh" : "Xoá lượt thi"}
        description={
          deleteTarget?.kind === "participant"
            ? `Xoá toàn bộ lượt thi (chính thức và thi thử) của ${deleteTarget.fullName}? Người này sẽ được thi lại từ đầu.`
            : `Xoá lượt thi này của ${deleteTarget?.fullName ?? ""}?`
        }
        isPending={isDeleting}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
