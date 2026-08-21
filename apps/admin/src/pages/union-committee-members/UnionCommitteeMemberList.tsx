import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDelete, useList } from "@refinedev/core";
import type { UnionCommitteeMemberDto, UnionDepartmentDto, UnionTermDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

/** Sentinel departmentId khớp BE (xem SCHOOL_LEVEL_SENTINEL trong union-committee-members.service.ts)
 * — lọc riêng cấp trường. "__all__" chỉ dùng nội bộ UI để nghĩa là "không lọc, lấy mọi cấp". */
const SCHOOL_LEVEL_VALUE = "__school__";
const ALL_LEVELS_VALUE = "__all__";

/** Trang "Ban chấp hành theo nhiệm kỳ" — chọn 1 nhiệm kỳ (mặc định nhiệm kỳ đương nhiệm nếu URL chưa
 * có ?termId=) rồi lọc thêm theo cấp (trường / 1 bộ phận cụ thể / tất cả). */
export function UnionCommitteeMemberList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const termId = searchParams.get("termId") ?? "";
  const [departmentFilter, setDepartmentFilter] = useState<string>(ALL_LEVELS_VALUE);

  const { data: termsResult, isLoading: termsLoading } = useList<UnionTermDto>({ resource: "union-terms" });
  const { data: deptsResult } = useList<UnionDepartmentDto>({ resource: "union-departments" });
  const terms = termsResult?.data ?? [];
  const departments = deptsResult?.data ?? [];

  // Chưa có ?termId= trên URL (vd vào thẳng trang từ menu) -> tự chọn nhiệm kỳ đương nhiệm, hoặc
  // nhiệm kỳ đầu tiên trong danh sách nếu chưa nhiệm kỳ nào được đánh dấu đương nhiệm.
  useEffect(() => {
    const firstTerm = termsResult?.data?.[0];
    if (!termId && firstTerm) {
      const defaultTerm = termsResult?.data?.find((t) => t.isCurrent) ?? firstTerm;
      setSearchParams({ termId: defaultTerm.id }, { replace: true });
    }
  }, [termId, termsResult, setSearchParams]);

  const { data: membersResult, isLoading: membersLoading } = useList<UnionCommitteeMemberDto>({
    resource: "union-committee-members",
    filters: [
      { field: "termId", operator: "eq", value: termId },
      ...(departmentFilter !== ALL_LEVELS_VALUE ? [{ field: "departmentId", operator: "eq" as const, value: departmentFilter }] : [])
    ],
    queryOptions: { enabled: Boolean(termId) }
  });
  const { mutate: deleteCommitteeMember, isLoading: isDeleting } = useDelete();

  const [deleteTarget, setDeleteTarget] = useState<UnionCommitteeMemberDto | null>(null);
  const members = membersResult?.data ?? [];
  // Refine/react-query v4: query `enabled: false` vẫn có isLoading=true khi chưa có data. Không gắn
  // membersLoading vào skeleton khi chưa chọn nhiệm kỳ — nếu không, trang kẹt 3 thanh skeleton mãi
  // khi chưa có nhiệm kỳ nào (dropdown trống, termId không bao giờ được set).
  const isLoading = termsLoading || (Boolean(termId) && membersLoading);

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteCommitteeMember(
      { resource: "union-committee-members", id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Ban chấp hành Công đoàn</h1>
          <p className="text-muted-foreground">Danh sách thành viên Ban chấp hành theo từng nhiệm kỳ.</p>
        </div>
        <Button onClick={() => navigate(`/union-committee-members/create?termId=${termId}`)} disabled={!termId}>
          Thêm thành viên
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-lg">
        <Select value={termId || undefined} onValueChange={(value) => setSearchParams({ termId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn nhiệm kỳ" />
          </SelectTrigger>
          <SelectContent>
            {terms.map((term) => (
              <SelectItem key={term.id} value={term.id}>
                {term.name}
                {term.isCurrent ? " (đương nhiệm)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_LEVELS_VALUE}>Tất cả các cấp</SelectItem>
            <SelectItem value={SCHOOL_LEVEL_VALUE}>Cấp trường</SelectItem>
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
              <TableHead>Công đoàn viên</TableHead>
              <TableHead>Chức vụ Ban chấp hành</TableHead>
              <TableHead>Cấp</TableHead>
              <TableHead>Thứ tự</TableHead>
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

            {!isLoading && terms.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Chưa có nhiệm kỳ nào. Hãy tạo nhiệm kỳ trước tại mục "Nhiệm kỳ Ban chấp hành", rồi quay lại đây để thêm thành viên.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && terms.length > 0 && members.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {termId
                    ? "Chưa có thành viên nào ở nhiệm kỳ/cấp đã chọn."
                    : "Chọn một nhiệm kỳ ở danh sách phía trên để xem thành viên Ban chấp hành."}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              members.map((cm) => (
                <TableRow key={cm.id}>
                  <TableCell className="font-medium">{cm.member.fullName}</TableCell>
                  <TableCell>{cm.positionTitle}</TableCell>
                  <TableCell>{cm.department ? cm.department.name : "Cấp trường"}</TableCell>
                  <TableCell>{cm.sortOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/union-committee-members/edit/${cm.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(cm)}>
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
        title="Xoá thành viên Ban chấp hành"
        description={`Bạn có chắc chắn muốn xoá "${deleteTarget?.member.fullName ?? ""}" khỏi Ban chấp hành nhiệm kỳ này? Không xoá hồ sơ công đoàn viên gốc.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
