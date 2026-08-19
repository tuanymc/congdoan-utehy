import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import type { UnionDepartmentDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

export function UnionDepartmentList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<UnionDepartmentDto>({ resource: "union-departments" });
  const { mutate: deleteDept, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<UnionDepartmentDto | null>(null);
  const departments = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteDept({ resource: "union-departments", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Công đoàn bộ phận</h1>
          <p className="text-muted-foreground">
            Tổng cộng {departments.length} bộ phận — dùng để nhóm/lọc danh bạ Công đoàn viên.
          </p>
        </div>
        <Button onClick={() => navigate("/union-departments/create")}>Thêm bộ phận</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên bộ phận</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && departments.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  Chưa có công đoàn bộ phận nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/union-departments/edit/${dept.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(dept)}>
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
        title="Xoá công đoàn bộ phận"
        description={`Bạn có chắc chắn muốn xoá bộ phận "${deleteTarget?.name ?? ""}"? Không thể xoá nếu còn công đoàn viên thuộc bộ phận này — hãy chuyển họ sang bộ phận khác trước.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
