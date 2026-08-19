import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import type { DocumentTypeDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

export function DocumentTypeList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<DocumentTypeDto>({ resource: "document-types" });
  const { mutate: deleteType, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<DocumentTypeDto | null>(null);

  const types = data?.data ?? [];
  const nameById = new Map(types.map((t) => [t.id, t.name]));

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteType(
      { resource: "document-types", id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Loại công văn</h1>
          <p className="text-muted-foreground">Tổng cộng {types.length} loại.</p>
        </div>
        <Button onClick={() => navigate("/document-types/create")}>Thêm loại công văn</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên loại</TableHead>
              <TableHead>Loại cha</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && types.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Chưa có loại công văn nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {type.parentId ? (nameById.get(type.parentId) ?? "—") : "—"}
                  </TableCell>
                  <TableCell className="max-w-sm truncate text-muted-foreground">{type.description ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/document-types/edit/${type.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(type)}>
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
        title="Xoá loại công văn"
        description={`Bạn có chắc chắn muốn xoá loại công văn "${deleteTarget?.name ?? ""}"? Không thể xoá nếu còn công văn hoặc loại con thuộc loại này.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
