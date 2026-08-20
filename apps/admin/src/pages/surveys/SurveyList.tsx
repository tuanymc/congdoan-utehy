import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import { BarChart3, ListChecks } from "lucide-react";
import type { SurveyDto } from "@congdoan/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

/** Danh sách "Khảo sát ý kiến" — CRUD phẳng, không phân trang. Quản lý câu hỏi và xem kết quả tách
 * thành 2 trang con riêng (SurveyQuestionsPage/SurveyResultsPage) thay vì gộp vào form Sửa, vì đây là
 * 2 luồng thao tác khác hẳn form CRUD phẳng thông thường. */
export function SurveyList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<SurveyDto>({ resource: "surveys" });
  const { mutate: deleteSurvey, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<SurveyDto | null>(null);

  const surveys = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteSurvey({ resource: "surveys", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Khảo sát ý kiến</h1>
          <p className="text-muted-foreground">Tổng cộng {surveys.length} khảo sát.</p>
        </div>
        <Button onClick={() => navigate("/surveys/create")}>Thêm khảo sát</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Số câu hỏi</TableHead>
              <TableHead>Số lượt trả lời</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && surveys.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Chưa có khảo sát nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium">{survey.title}</TableCell>
                  <TableCell>{survey.questionCount}</TableCell>
                  <TableCell>{survey.responseCount}</TableCell>
                  <TableCell>
                    <Badge variant={survey.isOpen ? "default" : "secondary"}>
                      {survey.isOpen ? "Đang mở" : "Đã đóng"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/surveys/${survey.id}/questions`)}>
                        <ListChecks className="size-4" />
                        Câu hỏi
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/surveys/${survey.id}/results`)}>
                        <BarChart3 className="size-4" />
                        Kết quả
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/surveys/edit/${survey.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(survey)}>
                        Xoá
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Xoá khảo sát"
        description={`Bạn có chắc chắn muốn xoá khảo sát "${deleteTarget?.title ?? ""}"? Toàn bộ câu hỏi và lượt trả lời đã ghi nhận cũng sẽ bị xoá theo. Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
