import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import { Pin } from "lucide-react";
import { PUBLIC_SERVICE_NOTICE_CATEGORY_LABELS } from "@congdoan/types";
import type { PublicServiceNoticeDto } from "@congdoan/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

/** Danh sách "Cảnh báo và nhắc việc" (nhóm 5 của Dịch vụ công) — CRUD phẳng, không phân trang, cùng
 * khuôn AiToolList.tsx. Sắp ghim lên đầu để cán bộ dễ quản lý (khớp thứ tự hiển thị công khai). */
export function PublicServiceNoticeList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<PublicServiceNoticeDto>({ resource: "public-service-notices" });
  const { mutate: deleteItem, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<PublicServiceNoticeDto | null>(null);

  const items = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteItem({ resource: "public-service-notices", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Cảnh báo và nhắc việc</h1>
          <p className="text-muted-foreground">Tổng cộng {items.length} thông báo — bảng tin chung, hiển thị công khai cho mọi người.</p>
        </div>
        <Button onClick={() => navigate("/public-service-notices/create")}>Thêm thông báo</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Phân loại</TableHead>
              <TableHead>Thời gian đăng</TableHead>
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

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Chưa có thông báo nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-1.5">
                      {item.isPinned ? <Pin className="size-3.5 shrink-0 text-primary" /> : null}
                      {item.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.category ? PUBLIC_SERVICE_NOTICE_CATEGORY_LABELS[item.category] : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(item.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Đang hiện" : "Đang ẩn"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/public-service-notices/edit/${item.id}`)}>
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
        title="Xoá thông báo"
        description={`Bạn có chắc chắn muốn xoá thông báo "${deleteTarget?.title ?? ""}"? Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
