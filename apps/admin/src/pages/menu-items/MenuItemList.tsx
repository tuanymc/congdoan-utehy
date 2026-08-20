import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import type { MenuItemDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

/** Danh sách menu điều hướng trang công khai — hiển thị dạng cây phẳng (mục cấp 1, kèm mục con thụt
 * lề ngay bên dưới) thay vì bảng phẳng thông thường, để admin thấy rõ cấu trúc dropdown thật khi sửa. */
export function MenuItemList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<MenuItemDto>({ resource: "menu-items" });
  const { mutate: deleteItem, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<MenuItemDto | null>(null);
  const items = data?.data ?? [];

  const topLevel = items.filter((item) => item.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);
  const childrenByParentId = new Map<string, MenuItemDto[]>();
  for (const item of items) {
    if (!item.parentId) continue;
    const list = childrenByParentId.get(item.parentId) ?? [];
    list.push(item);
    childrenByParentId.set(item.parentId, list);
  }
  for (const list of childrenByParentId.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const rows = topLevel.flatMap((item) => [
    { item, isChild: false },
    ...(childrenByParentId.get(item.id) ?? []).map((child) => ({ item: child, isChild: true }))
  ]);

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteItem({ resource: "menu-items", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  const deleteTargetChildCount = deleteTarget ? (childrenByParentId.get(deleteTarget.id) ?? []).length : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Menu điều hướng</h1>
          <p className="text-muted-foreground">
            Các mục hiển thị trên thanh menu chính của trang công khai. Mục cấp 1 có thể có thêm 1 lớp
            mục con (hiện dạng dropdown) — chọn "Sửa" để đổi mục cha, thứ tự, hoặc ẩn/hiện.
          </p>
        </div>
        <Button onClick={() => navigate("/menu-items/create")}>Thêm mục menu</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhãn</TableHead>
              <TableHead>Liên kết</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Chưa có mục menu nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              rows.map(({ item, isChild }) => (
                <TableRow key={item.id}>
                  <TableCell className={isChild ? "pl-10 text-muted-foreground" : "font-medium"}>
                    {isChild ? "— " : ""}
                    {item.label}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{item.url}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
                  <TableCell>
                    {!isChild && item.autoCategoryChildren ? (
                      <Badge variant="outline">Tự động thêm chuyên mục</Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "default" : "secondary"}>
                      {item.isActive ? "Đang hiện" : "Đang ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/menu-items/edit/${item.id}`)}>
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
        title="Xoá mục menu"
        description={
          deleteTargetChildCount > 0
            ? `Mục "${deleteTarget?.label ?? ""}" đang có ${deleteTargetChildCount} mục con — xoá sẽ xoá luôn các mục con này. Bạn có chắc chắn?`
            : `Bạn có chắc chắn muốn xoá mục menu "${deleteTarget?.label ?? ""}"? Hành động này không thể hoàn tác.`
        }
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
