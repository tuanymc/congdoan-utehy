import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import type { UnionTermDto } from "@congdoan/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

function formatYearRange(term: UnionTermDto): string {
  if (term.startYear && term.endYear) return `${term.startYear} - ${term.endYear}`;
  if (term.startYear) return `Từ ${term.startYear}`;
  if (term.endYear) return `Đến ${term.endYear}`;
  return "—";
}

export function UnionTermList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<UnionTermDto>({ resource: "union-terms" });
  const { mutate: deleteTerm, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<UnionTermDto | null>(null);
  const terms = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteTerm({ resource: "union-terms", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Nhiệm kỳ Ban chấp hành</h1>
          <p className="text-muted-foreground">
            Tổng cộng {terms.length} nhiệm kỳ — chọn "Thành viên" để quản lý Ban chấp hành của từng nhiệm kỳ.
          </p>
        </div>
        <Button onClick={() => navigate("/union-terms/create")}>Thêm nhiệm kỳ</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên nhiệm kỳ</TableHead>
              <TableHead>Giai đoạn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thứ tự</TableHead>
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

            {!isLoading && terms.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Chưa có nhiệm kỳ nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              terms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-medium">{term.name}</TableCell>
                  <TableCell>{formatYearRange(term)}</TableCell>
                  <TableCell>
                    {term.isCurrent ? <Badge>Đương nhiệm</Badge> : <Badge variant="outline">Đã qua</Badge>}
                  </TableCell>
                  <TableCell>{term.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/union-committee-members?termId=${term.id}`)}
                      >
                        Thành viên
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/union-terms/edit/${term.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(term)}>
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
        title="Xoá nhiệm kỳ"
        description={`Bạn có chắc chắn muốn xoá nhiệm kỳ "${deleteTarget?.name ?? ""}"? Toàn bộ danh sách Ban chấp hành thuộc nhiệm kỳ này sẽ bị xoá theo.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
