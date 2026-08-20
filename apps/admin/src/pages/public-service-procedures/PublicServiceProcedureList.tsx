import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import { PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS } from "@congdoan/types";
import type { PublicServiceProcedureDto } from "@congdoan/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

/** Danh sách "Thủ tục dịch vụ công" (nhóm 1+2 của Dịch vụ công) — CRUD phẳng, không phân trang, cùng
 * khuôn AiToolList.tsx. Cột "Trạng thái" nhắc rõ isActive=false = NHÁP (chưa rà soát) để cán bộ không
 * nhầm tưởng đã publish — xem ghi chú PublicServiceProcedure.isActive trong schema.prisma. */
export function PublicServiceProcedureList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<PublicServiceProcedureDto>({ resource: "public-service-procedures" });
  const { mutate: deleteItem, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<PublicServiceProcedureDto | null>(null);

  const items = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteItem(
      { resource: "public-service-procedures", id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Thủ tục dịch vụ công</h1>
          <p className="text-muted-foreground">
            Tổng cộng {items.length} thủ tục — chỉ thủ tục "Đã duyệt" mới hiển thị ở trang công khai.
          </p>
        </div>
        <Button onClick={() => navigate("/public-service-procedures/create")}>Thêm thủ tục</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên thủ tục</TableHead>
              <TableHead>Nhóm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Chưa có thủ tục nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{PUBLIC_SERVICE_PROCEDURE_CATEGORY_LABELS[item.category]}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "default" : "secondary"}>
                      {item.isActive ? "Đã duyệt — đang hiện" : "Nháp — chờ rà soát"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/public-service-procedures/edit/${item.id}`)}>
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
        title="Xoá thủ tục dịch vụ công"
        description={`Bạn có chắc chắn muốn xoá thủ tục "${deleteTarget?.title ?? ""}"? Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
