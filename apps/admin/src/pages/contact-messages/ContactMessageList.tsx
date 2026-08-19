import { useEffect, useState } from "react";
import { useDelete, useTable, useUpdate } from "@refinedev/core";
import type { CrudFilter } from "@refinedev/core";
import type { ContactMessageDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

/** Hộp thư "Liên hệ" — tin nhắn chỉ được tạo qua form công khai apps/web (xem contact-messages.controller.ts),
 * trang này chỉ đọc/đánh dấu đã đọc/xoá — không có form tạo/sửa. */
export function ContactMessageList() {
  const { mutate: updateMessage } = useUpdate();
  const { mutate: deleteMessage, isLoading: isDeleting } = useDelete();

  const [readFilter, setReadFilter] = useState<"ALL" | "true" | "false">("ALL");
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageDto | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { tableQueryResult, current, setCurrent, pageCount, setFilters } = useTable<ContactMessageDto>({
    resource: "contact-messages",
    pagination: { current: 1, pageSize: 20 },
    sorters: { initial: [{ field: "createdAt", order: "desc" }] }
  });

  useEffect(() => {
    const filters: CrudFilter[] = [];
    if (readFilter !== "ALL") filters.push({ field: "isRead", operator: "eq", value: readFilter });
    setFilters(filters, "replace");
  }, [readFilter, setFilters]);

  const messages = tableQueryResult.data?.data ?? [];
  const total = tableQueryResult.data?.total ?? 0;
  const isLoading = tableQueryResult.isLoading;

  function toggleRead(message: ContactMessageDto) {
    updateMessage({ resource: "contact-messages", id: message.id, values: { isRead: !message.isRead } });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteMessage({ resource: "contact-messages", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Liên hệ</h1>
          <p className="text-muted-foreground">Tổng cộng {total} tin nhắn từ trang "Liên hệ" công khai.</p>
        </div>
        <Select value={readFilter} onValueChange={(value) => setReadFilter(value as "ALL" | "true" | "false")}>
          <SelectTrigger className="sm:max-w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="false">Chưa đọc</SelectItem>
            <SelectItem value="true">Đã đọc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người gửi</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Chưa có tin nhắn liên hệ nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              messages.map((message) => (
                <TableRow key={message.id} className={message.isRead ? undefined : "bg-muted/40"}>
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div>{message.email}</div>
                    {message.phone && <div>{message.phone}</div>}
                  </TableCell>
                  <TableCell
                    className="max-w-sm cursor-pointer text-muted-foreground"
                    onClick={() => setExpandedId(expandedId === message.id ? null : message.id)}
                  >
                    {expandedId === message.id ? message.message : `${message.message.slice(0, 80)}${message.message.length > 80 ? "..." : ""}`}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(message.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={message.isRead ? "secondary" : "default"}>{message.isRead ? "Đã đọc" : "Chưa đọc"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleRead(message)}>
                        {message.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(message)}>
                        Xoá
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setCurrent(current - 1)}>
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {current} / {pageCount}
          </span>
          <Button variant="outline" size="sm" disabled={current >= pageCount} onClick={() => setCurrent(current + 1)}>
            Sau
          </Button>
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Xoá tin nhắn liên hệ"
        description={`Bạn có chắc chắn muốn xoá tin nhắn từ "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
