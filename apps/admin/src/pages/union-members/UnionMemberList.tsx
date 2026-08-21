import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useList, useTable } from "@refinedev/core";
import type { CrudFilter } from "@refinedev/core";
import type { UnionDepartmentDto, UnionMemberImportResultDto, UnionMemberListItemDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";
import { pushToast } from "../../components/common/toast-store";
import { apiFetchBlob, apiFetchUpload } from "../../lib/api-client";

/** Trang quản trị danh bạ Công đoàn viên (thay modules/GioiThieuCongDoanVien.aspx phần quản lý web
 * cũ) — khác endpoint công khai, hiển thị TOÀN BỘ kể cả người đang "Đang ẩn" (isPublic=false) để admin
 * tự bật/tắt hiển thị. Có thêm Xuất/Nhập Excel toàn bộ hồ sơ (~90 field, xem
 * union-members-excel.service.ts) để cập nhật hàng loạt nhanh hơn sửa từng người 1. */
export function UnionMemberList() {
  const navigate = useNavigate();
  const { mutate: deleteMember, isLoading: isDeleting } = useDelete();
  const { data: deptsResult } = useList<UnionDepartmentDto>({ resource: "union-departments" });

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<UnionMemberListItemDto | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<UnionMemberImportResultDto | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { tableQueryResult, current, setCurrent, pageCount, setFilters } = useTable<UnionMemberListItemDto>({
    resource: "union-members",
    pagination: { current: 1, pageSize: 24 }
  });

  useEffect(() => {
    const filters: CrudFilter[] = [];
    if (debouncedSearch) filters.push({ field: "search", operator: "contains", value: debouncedSearch });
    if (departmentId !== "ALL") filters.push({ field: "departmentId", operator: "eq", value: departmentId });
    setFilters(filters, "replace");
  }, [debouncedSearch, departmentId, setFilters]);

  const members = tableQueryResult.data?.data ?? [];
  const total = tableQueryResult.data?.total ?? 0;
  const isLoading = tableQueryResult.isLoading;
  const departments = deptsResult?.data ?? [];

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteMember({ resource: "union-members", id: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const { blob, fileName } = await apiFetchBlob("/admin/union-members/export.xlsx");
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      pushToast({
        variant: "error",
        message: "Không xuất được file Excel",
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau."
      });
    } finally {
      setIsExporting(false);
    }
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  async function handleImportFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset ngay để lần sau chọn LẠI đúng file cũ vẫn bắn onChange (input file không tự đổi giá trị
    // nếu chọn lại cùng 1 file, browser không coi đó là "thay đổi").
    event.target.value = "";
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiFetchUpload<UnionMemberImportResultDto>("/admin/union-members/import", formData);
      setImportResult(result);
      await tableQueryResult.refetch();
    } catch (error) {
      pushToast({
        variant: "error",
        message: "Import Excel thất bại",
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau."
      });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Công đoàn viên</h1>
          <p className="text-muted-foreground">Tổng cộng {total} công đoàn viên.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void handleExport()} disabled={isExporting}>
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
            {isImporting ? "Đang nhập..." : "Nhập Excel"}
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(event) => void handleImportFileSelected(event)}
          />
          <Button onClick={() => navigate("/union-members/create")}>Thêm công đoàn viên</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Xuất Excel để tải toàn bộ hồ sơ (kể cả các trường nội bộ) ra file mẫu, chỉnh sửa rồi nhập lại — dòng có
        "Mã cán bộ" khớp sẵn có sẽ được cập nhật, dòng mới hoặc không khớp sẽ tự tạo công đoàn viên mới.
      </p>

      <div className="flex flex-col gap-3 lg:flex-row">
        <Input
          placeholder="Tìm theo họ tên..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="lg:max-w-xs"
        />
        <Select value={departmentId} onValueChange={setDepartmentId}>
          <SelectTrigger className="lg:max-w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả công đoàn bộ phận</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Bộ phận</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && members.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Không có công đoàn viên nào phù hợp.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{member.positionTitle ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{member.department?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{member.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={member.isPublic ? "default" : "secondary"}>
                      {member.isPublic ? "Đang hiển thị" : "Đang ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/union-members/edit/${member.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(member)}>
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
        title="Xoá công đoàn viên"
        description={`Bạn có chắc chắn muốn xoá "${deleteTarget?.fullName ?? ""}" khỏi danh bạ? Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <Dialog open={importResult !== null} onOpenChange={(open) => !open && setImportResult(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kết quả nhập Excel</DialogTitle>
            <DialogDescription>
              Tổng {importResult?.totalRows ?? 0} dòng dữ liệu — {importResult?.created ?? 0} tạo mới,{" "}
              {importResult?.updated ?? 0} cập nhật
              {importResult && importResult.errors.length > 0 ? `, ${importResult.errors.length} dòng lỗi` : ""}.
            </DialogDescription>
          </DialogHeader>

          {importResult && importResult.errors.length > 0 ? (
            <div className="flex flex-col gap-1 rounded-md border p-3 text-sm">
              {importResult.errors.map((err) => (
                <p key={err.row} className="text-destructive">
                  Dòng {err.row}: {err.message}
                </p>
              ))}
            </div>
          ) : null}

          <DialogFooter>
            <Button onClick={() => setImportResult(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
