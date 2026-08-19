import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import type { HomeSlideDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

export function HomeSlideList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<HomeSlideDto>({ resource: "home-slides" });
  const { mutate: deleteSlide, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<HomeSlideDto | null>(null);
  const slides = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteSlide({ resource: "home-slides", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Banner trang chủ</h1>
          <p className="text-muted-foreground">Tổng cộng {slides.length} banner. Chỉ banner "Đang hiển thị" mới xuất hiện ở slider trang chủ.</p>
        </div>
        <Button onClick={() => navigate("/home-slides/create")}>Thêm banner</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Liên kết</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Trạng thái</TableHead>
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

            {!isLoading && slides.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Chưa có banner nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              slides.map((slide) => (
                <TableRow key={slide.id}>
                  <TableCell>
                    <img src={slide.imageUrl} alt={slide.name} className="h-12 w-20 rounded object-cover" />
                  </TableCell>
                  <TableCell className="font-medium">{slide.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{slide.linkUrl ?? "—"}</TableCell>
                  <TableCell>{slide.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={slide.isActive ? "default" : "secondary"}>
                      {slide.isActive ? "Đang hiển thị" : "Đang ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/home-slides/edit/${slide.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(slide)}>
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
        title="Xoá banner"
        description={`Bạn có chắc chắn muốn xoá banner "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
