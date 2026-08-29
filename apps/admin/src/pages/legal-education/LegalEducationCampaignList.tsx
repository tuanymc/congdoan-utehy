import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import { BarChart3, FileText, ListChecks } from "lucide-react";
import type { LegalEducationCampaignDto } from "@congdoan/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

export function LegalEducationCampaignList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<LegalEducationCampaignDto>({ resource: "legal-education-campaigns" });
  const { mutate: deleteCampaign, isLoading: isDeleting } = useDelete();
  const [deleteTarget, setDeleteTarget] = useState<LegalEducationCampaignDto | null>(null);

  const items = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteCampaign({ resource: "legal-education-campaigns", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Phổ biến pháp luật</h1>
          <p className="text-muted-foreground">Tổng cộng {items.length} đợt. Tài liệu công khai; bài thi chỉ mở khi bật "Đang mở thi".</p>
        </div>
        <Button onClick={() => navigate("/legal-education-campaigns/create")}>Thêm đợt</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Tài liệu</TableHead>
              <TableHead>Câu hỏi</TableHead>
              <TableHead>Xuất bản</TableHead>
              <TableHead>Thi</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Chưa có đợt phổ biến pháp luật nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.title}
                    {item.periodLabel ? <p className="text-xs text-muted-foreground">{item.periodLabel}</p> : null}
                  </TableCell>
                  <TableCell>{item.materialCount}</TableCell>
                  <TableCell>{item.exam?.questionCount ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={item.isPublished ? "default" : "secondary"}>
                      {item.isPublished ? "Công khai" : "Nháp"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.exam?.isOpen ? "default" : "secondary"}>
                      {item.exam?.isOpen ? "Đang mở thi" : "Chưa mở thi"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/legal-education-campaigns/${item.id}/materials`)}>
                        <FileText className="size-4" />
                        Tài liệu
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/legal-education-campaigns/${item.id}/questions`)}>
                        <ListChecks className="size-4" />
                        Câu hỏi
                      </Button>
                      {item.exam ? (
                        <Button variant="outline" size="sm" onClick={() => navigate(`/legal-education-campaigns/${item.id}/results`)}>
                          <BarChart3 className="size-4" />
                          Kết quả
                        </Button>
                      ) : null}
                      <Button variant="outline" size="sm" onClick={() => navigate(`/legal-education-campaigns/edit/${item.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(item)}>
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
        title="Xoá đợt phổ biến"
        description={`Bạn có chắc chắn muốn xoá đợt "${deleteTarget?.title ?? ""}"? Toàn bộ tài liệu, câu hỏi và lượt thi cũng sẽ bị xoá.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
