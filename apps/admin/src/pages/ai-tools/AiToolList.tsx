import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import { ExternalLink } from "lucide-react";
import type { AiToolResourceDto } from "@congdoan/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

/** Danh sách "Kho công cụ AI" — CRUD phẳng, không phân trang (số lượng công cụ nhỏ, giống loại công
 * văn/banner trang chủ). Sắp xếp theo sortOrder do API trả về sẵn, không tự sort lại ở FE. */
export function AiToolList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<AiToolResourceDto>({ resource: "ai-tools" });
  const { mutate: deleteTool, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<AiToolResourceDto | null>(null);

  const tools = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteTool({ resource: "ai-tools", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Kho công cụ AI</h1>
          <p className="text-muted-foreground">
            Tổng cộng {tools.length} công cụ — hiển thị ở trang công khai cho đoàn viên đã đăng nhập.
          </p>
        </div>
        <Button onClick={() => navigate("/ai-tools/create")}>Thêm công cụ</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên công cụ</TableHead>
              <TableHead>Phân loại</TableHead>
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

            {!isLoading && tools.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Chưa có công cụ AI nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell className="text-muted-foreground">{tool.category ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      <span className="truncate">{tool.url}</span>
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.isActive ? "default" : "secondary"}>
                      {tool.isActive ? "Đang hiện" : "Đang ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/ai-tools/edit/${tool.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(tool)}>
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
        title="Xoá công cụ AI"
        description={`Bạn có chắc chắn muốn xoá công cụ "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
