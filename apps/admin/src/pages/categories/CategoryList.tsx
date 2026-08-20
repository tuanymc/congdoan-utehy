import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList, useUpdate } from "@refinedev/core";
import { Eye, EyeOff } from "lucide-react";
import type { CategoryDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

export function CategoryList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<CategoryDto>({ resource: "categories" });
  const { mutate: deleteCategory, isLoading: isDeleting } = useDelete();
  const { mutate: updateCategory } = useUpdate();

  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const categories = [...(data?.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteCategory(
      { resource: "categories", id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) }
    );
  }

  /** Ẩn/hiện mục menu tự động trỏ tới chuyên mục này (dropdown "Tin hoạt động") — đổi ngay tại danh
   * sách, không cần mở form Sửa. KHÔNG ảnh hưởng bài viết chuyên mục vẫn hiển thị bình thường ở
   * /tin-tuc, chỉ ẩn/hiện mục trong menu (xem Category.showInMenu trong schema.prisma). */
  function toggleShowInMenu(category: CategoryDto) {
    setTogglingId(category.id);
    updateCategory(
      { resource: "categories", id: category.id, values: { showInMenu: !category.showInMenu } },
      { onSettled: () => setTogglingId(null) }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Chuyên mục</h1>
          <p className="text-muted-foreground">Tổng cộng {categories.length} chuyên mục.</p>
        </div>
        <Button onClick={() => navigate("/categories/create")}>Thêm chuyên mục</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Tên chuyên mục</TableHead>
              <TableHead>Đường dẫn (slug)</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Hiện trong menu</TableHead>
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

            {!isLoading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Chưa có chuyên mục nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.sortOrder}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="max-w-sm truncate text-muted-foreground">{category.description ?? "—"}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      disabled={togglingId === category.id}
                      onClick={() => toggleShowInMenu(category)}
                      className="inline-flex items-center gap-1.5 disabled:opacity-60"
                      title={
                        category.showInMenu
                          ? 'Đang hiện trong dropdown "Tin hoạt động" — bấm để ẩn'
                          : 'Đang ẩn khỏi dropdown "Tin hoạt động" — bấm để hiện lại'
                      }
                    >
                      <Badge variant={category.showInMenu ? "default" : "secondary"}>
                        {category.showInMenu ? (
                          <span className="flex items-center gap-1">
                            <Eye className="size-3" /> Đang hiện
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <EyeOff className="size-3" /> Đang ẩn
                          </span>
                        )}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/categories/edit/${category.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(category)}>
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
        title="Xoá chuyên mục"
        description={`Bạn có chắc chắn muốn xoá chuyên mục "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
