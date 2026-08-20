import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft } from "lucide-react";
import type { EventDetailDto, EventRegistrationDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { PageLoading } from "../../components/common/PageLoading";
import { apiFetch } from "../../lib/api-client";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/** Danh sách người đăng ký tham gia 1 hoạt động — chỉ xem, không có thao tác sửa/xoá (nếu cần huỷ 1
 * lượt đăng ký, quản trị viên hiện chưa có API riêng — có thể bổ sung sau nếu phát sinh nhu cầu). */
export function EventRegistrantsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: eventResult, isLoading: eventLoading } = useOne<EventDetailDto>({
    resource: "events",
    id,
    queryOptions: { enabled: Boolean(id) }
  });

  const [registrations, setRegistrations] = useState<EventRegistrationDto[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setRegistrationsLoading(true);
    apiFetch<EventRegistrationDto[]>(`/admin/events/${id}/registrations`)
      .then((data) => {
        if (!cancelled) setRegistrations(data);
      })
      .finally(() => {
        if (!cancelled) setRegistrationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isLoading = eventLoading || registrationsLoading;

  if (eventLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate("/events")}>
          <ArrowLeft className="size-4" />
          Quay lại danh sách hoạt động
        </Button>
        <h1 className="text-2xl font-semibold">Người đăng ký — {eventResult?.data?.title}</h1>
        <p className="text-muted-foreground">Tổng cộng {registrations.length} lượt đăng ký.</p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Thời gian đăng ký</TableHead>
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

            {!isLoading && registrations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Chưa có ai đăng ký hoạt động này.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">{registration.fullName}</TableCell>
                  <TableCell>{registration.email}</TableCell>
                  <TableCell>{registration.phone ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate" title={registration.note ?? undefined}>
                    {registration.note ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(registration.registeredAt)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
