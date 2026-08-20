import { Fragment, useState } from "react";
import { useGetIdentity, useList, useUpdate } from "@refinedev/core";
import { PUBLIC_SERVICE_SUPPORT_REQUEST_STATUS_LABELS, PUBLIC_SERVICE_SUPPORT_REQUEST_STATUSES } from "@congdoan/types";
import type { AuthUser, PublicServiceSupportRequestDto, PublicServiceSupportRequestStatus } from "@congdoan/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

const STATUS_BADGE_VARIANT: Record<PublicServiceSupportRequestStatus, "default" | "secondary" | "outline"> = {
  NEW: "default",
  IN_PROGRESS: "outline",
  RESOLVED: "secondary",
  CLOSED: "secondary"
};

const ALL_STATUS = "ALL";

/** Triage "Công đoàn hỗ trợ tôi" (nhóm 4 — PHẦN NỔI BẬT NHẤT của Dịch vụ công) — yêu cầu chỉ được tạo
 * qua form công khai (apps/web), trang này chỉ xem + đổi trạng thái/ghi chú nội bộ. Phân công cán bộ
 * dùng nút "Nhận xử lý"/"Bỏ nhận" TỰ GÁN CHO CHÍNH MÌNH thay vì dropdown chọn người, vì endpoint GET
 * /users chỉ ADMIN gọi được (xem users.controller.ts @Roles("ADMIN")) trong khi UNION_CLERK cũng có
 * quyền "publicservicesupportrequest:update" — dropdown chọn người sẽ vỡ với UNION_CLERK. */
export function PublicServiceSupportRequestList() {
  const { data: identity } = useGetIdentity<AuthUser>();
  const { data, isLoading, refetch } = useList<PublicServiceSupportRequestDto>({ resource: "public-service-support-requests" });
  const { mutate: updateItem, isLoading: isSaving } = useUpdate();

  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<PublicServiceSupportRequestStatus>("NEW");
  const [draftNote, setDraftNote] = useState("");

  const items = data?.data ?? [];
  const filteredItems = statusFilter === ALL_STATUS ? items : items.filter((item) => item.status === statusFilter);

  function toggleExpand(item: PublicServiceSupportRequestDto) {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    setDraftStatus(item.status);
    setDraftNote(item.staffNote ?? "");
  }

  function handleSave(item: PublicServiceSupportRequestDto) {
    updateItem(
      {
        resource: "public-service-support-requests",
        id: item.id,
        values: { status: draftStatus, staffNote: draftNote.trim() || undefined }
      },
      { onSuccess: () => refetch() }
    );
  }

  function handleAssignSelf(item: PublicServiceSupportRequestDto) {
    if (!identity) return;
    updateItem(
      { resource: "public-service-support-requests", id: item.id, values: { assignedToUserId: identity.id } },
      { onSuccess: () => refetch() }
    );
  }

  function handleUnassign(item: PublicServiceSupportRequestDto) {
    updateItem(
      { resource: "public-service-support-requests", id: item.id, values: { assignedToUserId: null } },
      { onSuccess: () => refetch() }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Công đoàn hỗ trợ tôi</h1>
          <p className="text-muted-foreground">Tổng cộng {items.length} yêu cầu hỗ trợ gửi từ trang "Dịch vụ công" công khai.</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:max-w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>Tất cả trạng thái</SelectItem>
            {PUBLIC_SERVICE_SUPPORT_REQUEST_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {PUBLIC_SERVICE_SUPPORT_REQUEST_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người gửi</TableHead>
              <TableHead>Thủ tục</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Phụ trách</TableHead>
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

            {!isLoading && filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Chưa có yêu cầu hỗ trợ nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              filteredItems.map((item) => (
                <Fragment key={item.id}>
                  <TableRow className={item.status === "NEW" ? "bg-muted/40" : undefined}>
                    <TableCell className="font-medium">
                      <div>{item.fullName}</div>
                      <div className="text-xs text-muted-foreground">{[item.phone, item.email].filter(Boolean).join(" · ")}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.procedureTitle ?? item.procedureOther ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(item.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{item.assignedToName ?? "Chưa phân công"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[item.status]}>{PUBLIC_SERVICE_SUPPORT_REQUEST_STATUS_LABELS[item.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleExpand(item)}>
                        {expandedId === item.id ? "Đóng" : "Xử lý"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === item.id && (
                    <TableRow key={`${item.id}-detail`}>
                      <TableCell colSpan={6} className="bg-muted/20">
                        <div className="flex flex-col gap-4 py-2">
                          {item.stuckStep ? (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Đang vướng ở bước nào?</p>
                              <p className="text-sm">{item.stuckStep}</p>
                            </div>
                          ) : null}
                          {item.description ? (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Mô tả chi tiết</p>
                              <p className="whitespace-pre-line text-sm">{item.description}</p>
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Phân công:</span>
                            <Button variant="outline" size="sm" onClick={() => handleAssignSelf(item)} disabled={isSaving}>
                              Nhận xử lý (tôi)
                            </Button>
                            {item.assignedToUserId ? (
                              <Button variant="ghost" size="sm" onClick={() => handleUnassign(item)} disabled={isSaving}>
                                Bỏ phân công
                              </Button>
                            ) : null}
                          </div>

                          <div className="grid gap-2 sm:max-w-xs">
                            <span className="text-xs font-medium text-muted-foreground">Trạng thái</span>
                            <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as PublicServiceSupportRequestStatus)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PUBLIC_SERVICE_SUPPORT_REQUEST_STATUSES.map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {PUBLIC_SERVICE_SUPPORT_REQUEST_STATUS_LABELS[value]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Ghi chú nội bộ (không hiển thị công khai)</span>
                            <Textarea rows={3} value={draftNote} onChange={(event) => setDraftNote(event.target.value)} />
                          </div>

                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => handleSave(item)} disabled={isSaving}>
                              {isSaving ? "Đang lưu..." : "Lưu trạng thái & ghi chú"}
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
