import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import { ExternalLink } from "lucide-react";
import type { PublicServiceLinkDto } from "@congdoan/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

/** Danh sách "Kho biểu mẫu và đường dẫn chính thống" (nhóm 3 của Dịch vụ công) — CRUD phẳng, không phân
 * trang, cùng khuôn AiToolList.tsx. */
export function PublicServiceLinkList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<PublicServiceLinkDto>({ resource: "public-service-links" });
  const { mutate: deleteItem, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<PublicServiceLinkDto | null>(null);

  const items = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteItem({ resource: "public-service-links", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Kho biểu mẫu và đường dẫn chính thống</h1>
          <p className="text-muted-foreground">
            Tổng cộng {items.length} liên kết — hiển thị kèm mã QR ở trang công khai để đoàn viên quét truy cập nhanh.
          </p>
        </div>
        <Button onClick={() => navigate("/public-service-links/create")}>Thêm liên kết</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Nhóm</TableHead>
              <TableHead>Đường dẫn</TableHead>
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
                  Chưa có liên kết nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.group ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      <span className="truncate">{item.url}</span>
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Đang hiện" : "Đang ẩn"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/public-service-links/edit/${item.id}`)}>
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
        title="Xoá liên kết"
        description={`Bạn có chắc chắn muốn xoá liên kết "${deleteTarget?.title ?? ""}"? Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
