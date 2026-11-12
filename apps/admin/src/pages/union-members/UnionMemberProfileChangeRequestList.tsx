import { Fragment, useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import {
  UNION_MEMBER_PROFILE_CHANGE_STATUS_LABELS,
  UNION_MEMBER_PROFILE_CHANGE_STATUSES,
  type UnionMemberProfileChangeRequestDto,
  type UnionMemberProfileChangeStatus
} from "@congdoan/types";
import { apiFetch } from "../../lib/api-client";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { pushToast } from "../../components/common/toast-store";

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

const STATUS_BADGE: Record<UnionMemberProfileChangeStatus, "default" | "secondary" | "outline"> = {
  PENDING: "default",
  APPROVED: "secondary",
  REJECTED: "outline"
};

const ALL_STATUS = "ALL";

function FieldDiff({ label, current, proposed }: { label: string; current: string | null; proposed: string | null }) {
  const changed = (current ?? "") !== (proposed ?? "");
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr_1fr]">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">
        <span className="text-xs text-muted-foreground">Hiện tại: </span>
        {current || "—"}
      </p>
      <p className={`text-sm ${changed ? "font-medium text-primary" : ""}`}>
        <span className="text-xs text-muted-foreground">Đề xuất: </span>
        {proposed || "—"}
      </p>
    </div>
  );
}

/** Duyệt yêu cầu đoàn viên tự cập nhật ảnh / chức vụ / trình độ từ cổng /cong-doan-vien. */
export function UnionMemberProfileChangeRequestList() {
  const { data, isLoading, refetch } = useList<UnionMemberProfileChangeRequestDto>({
    resource: "union-member-profile-change-requests"
  });
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const items = data?.data ?? [];
  const filteredItems = useMemo(
    () => (statusFilter === ALL_STATUS ? items : items.filter((item) => item.status === statusFilter)),
    [items, statusFilter]
  );

  function toggleExpand(item: UnionMemberProfileChangeRequestDto) {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    setReviewNote(item.reviewNote ?? "");
  }

  async function review(item: UnionMemberProfileChangeRequestDto, action: "approve" | "reject") {
    setBusyId(item.id);
    try {
      await apiFetch(`/admin/union-member-profile-change-requests/${item.id}/${action}`, {
        method: "POST",
        body: { reviewNote: reviewNote.trim() || undefined }
      });
      pushToast({
        variant: "success",
        message: action === "approve" ? "Đã duyệt và cập nhật danh bạ." : "Đã từ chối yêu cầu."
      });
      setExpandedId(null);
      await refetch();
    } catch (error) {
      pushToast({
        variant: "error",
        message: error instanceof Error ? error.message : "Không thể xử lý yêu cầu."
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Duyệt hồ sơ đoàn viên</h1>
          <p className="text-muted-foreground">
            Yêu cầu đổi ảnh, chức vụ, trình độ từ cổng đoàn viên. Duyệt xong mới hiện trên danh bạ công khai.
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:max-w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>Tất cả trạng thái</SelectItem>
            {UNION_MEMBER_PROFILE_CHANGE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {UNION_MEMBER_PROFILE_CHANGE_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Đoàn viên</TableHead>
              <TableHead>Bộ phận</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Không có yêu cầu nào.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              filteredItems.map((item) => (
                <Fragment key={item.id}>
                  <TableRow className={item.status === "PENDING" ? "bg-muted/40" : undefined}>
                    <TableCell className="font-medium">
                      <div>{item.memberFullName}</div>
                      <div className="text-xs text-muted-foreground">{item.memberLegacyCode ?? "—"}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.departmentName ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[item.status]}>
                        {UNION_MEMBER_PROFILE_CHANGE_STATUS_LABELS[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleExpand(item)}>
                        {expandedId === item.id ? "Đóng" : item.status === "PENDING" ? "Duyệt" : "Xem"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === item.id ? (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/20">
                        <div className="space-y-4 py-2">
                          <div className="flex flex-wrap gap-6">
                            <div>
                              <p className="mb-1 text-xs text-muted-foreground">Ảnh hiện tại</p>
                              {item.currentPhotoUrl ? (
                                <img
                                  src={item.currentPhotoUrl}
                                  alt=""
                                  className="size-20 rounded-md object-cover ring-1 ring-border"
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">Chưa có</p>
                              )}
                            </div>
                            <div>
                              <p className="mb-1 text-xs text-muted-foreground">Ảnh đề xuất</p>
                              {item.photoUrl ? (
                                <img
                                  src={item.photoUrl}
                                  alt=""
                                  className="size-20 rounded-md object-cover ring-1 ring-border"
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">Chưa có</p>
                              )}
                            </div>
                          </div>
                          <FieldDiff label="Chức vụ" current={item.currentPositionTitle} proposed={item.positionTitle} />
                          <FieldDiff label="Trình độ" current={item.currentDegreeLabel} proposed={item.degreeLabel} />
                          {item.reviewedByName ? (
                            <p className="text-xs text-muted-foreground">
                              Xử lý bởi {item.reviewedByName}
                              {item.reviewedAt ? ` · ${formatDateTime(item.reviewedAt)}` : ""}
                              {item.reviewNote ? ` — ${item.reviewNote}` : ""}
                            </p>
                          ) : null}
                          {item.status === "PENDING" ? (
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Ghi chú duyệt / lý do từ chối (không bắt buộc)"
                                value={reviewNote}
                                onChange={(event) => setReviewNote(event.target.value)}
                                rows={2}
                              />
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  disabled={busyId === item.id}
                                  onClick={() => void review(item, "approve")}
                                >
                                  Duyệt và cập nhật danh bạ
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busyId === item.id}
                                  onClick={() => void review(item, "reject")}
                                >
                                  Từ chối
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
