import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import { Users } from "lucide-react";
import type { EventDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function EventList() {
  const navigate = useNavigate();
  const { data, isLoading } = useList<EventDto>({ resource: "events", pagination: { pageSize: 100 } });
  const { mutate: deleteEvent, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<EventDto | null>(null);

  const events = data?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteEvent({ resource: "events", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Đăng ký hoạt động</h1>
          <p className="text-muted-foreground">Tổng cộng {events.length} hoạt động.</p>
        </div>
        <Button onClick={() => navigate("/events/create")}>Thêm hoạt động</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên hoạt động</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Số lượng đăng ký</TableHead>
              <TableHead>Hiển thị</TableHead>
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

            {!isLoading && events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Chưa có hoạt động nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(event.startAt)}
                    {event.endAt ? ` – ${formatDateTime(event.endAt)}` : ""}
                  </TableCell>
                  <TableCell>
                    {event.registrationCount ?? 0}
                    {event.capacity != null ? ` / ${event.capacity}` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.isPublic ? "default" : "secondary"}>
                      {event.isPublic ? "Đang hiện" : "Đang ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}/registrations`)}>
                        <Users className="size-4" />
                        Người đăng ký
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/events/edit/${event.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(event)}>
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
        title="Xoá hoạt động"
        description={`Bạn có chắc chắn muốn xoá hoạt động "${deleteTarget?.title ?? ""}"? Toàn bộ danh sách người đã đăng ký cũng sẽ bị xoá theo. Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
