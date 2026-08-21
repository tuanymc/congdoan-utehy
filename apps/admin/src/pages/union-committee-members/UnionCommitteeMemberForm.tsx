import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCreate, useList, useOne, useUpdate } from "@refinedev/core";
import type {
  CreateUnionCommitteeMemberRequest,
  UnionCommitteeMemberDto,
  UnionCommitteeMemberSummaryDto,
  UnionDepartmentDto,
  UnionMemberListItemDto,
  UnionTermDto
} from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface UnionCommitteeMemberFormProps {
  mode: "create" | "edit";
}

/// Khớp SCHOOL_LEVEL_SENTINEL ở BE (union-committee-members.service.ts) — "" thay vì rỗng để Select
/// luôn có 1 giá trị hợp lệ hiển thị được.
const SCHOOL_LEVEL_VALUE = "__school__";

export function UnionCommitteeMemberForm({ mode }: UnionCommitteeMemberFormProps) {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: cmResult, isLoading: cmLoading } = useOne<UnionCommitteeMemberDto>({
    resource: "union-committee-members",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { data: termsResult, isLoading: termsLoading } = useList<UnionTermDto>({ resource: "union-terms" });
  const { data: deptsResult } = useList<UnionDepartmentDto>({ resource: "union-departments" });
  const { mutate: createCm, isLoading: isCreating } = useCreate();
  const { mutate: updateCm, isLoading: isUpdating } = useUpdate();

  const [termId, setTermId] = useState("");
  const [departmentId, setDepartmentId] = useState<string>(SCHOOL_LEVEL_VALUE);
  const [positionTitle, setPositionTitle] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [note, setNote] = useState("");

  const [selectedMember, setSelectedMember] = useState<UnionCommitteeMemberSummaryDto | null>(null);
  const [memberSearchInput, setMemberSearchInput] = useState("");
  const [debouncedMemberSearch, setDebouncedMemberSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMemberSearch(memberSearchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [memberSearchInput]);

  const { data: memberSearchResult, isLoading: memberSearchLoading } = useList<UnionMemberListItemDto>({
    resource: "union-members",
    pagination: { current: 1, pageSize: 8 },
    filters: debouncedMemberSearch ? [{ field: "search", operator: "contains", value: debouncedMemberSearch }] : [],
    queryOptions: { enabled: debouncedMemberSearch.length > 0 }
  });
  const memberSearchResults = memberSearchResult?.data ?? [];

  useEffect(() => {
    if (mode === "create" && !termId) {
      const fromQuery = searchParams.get("termId");
      if (fromQuery) setTermId(fromQuery);
    }
  }, [mode, termId, searchParams]);

  useEffect(() => {
    if (mode === "edit" && cmResult?.data) {
      const cm = cmResult.data;
      setTermId(cm.termId);
      setDepartmentId(cm.departmentId ?? SCHOOL_LEVEL_VALUE);
      setPositionTitle(cm.positionTitle);
      setSortOrder(String(cm.sortOrder));
      setNote(cm.note ?? "");
      setSelectedMember(cm.member);
    }
  }, [mode, cmResult]);

  const terms = termsResult?.data ?? [];
  const departments = deptsResult?.data ?? [];
  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && cmLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMember) return;

    const payload: CreateUnionCommitteeMemberRequest = {
      termId,
      memberId: selectedMember.id,
      departmentId,
      positionTitle,
      sortOrder: Number(sortOrder) || 0,
      note: note.trim() || undefined
    };

    const backTo = `/union-committee-members?termId=${termId}`;
    if (mode === "create") {
      createCm({ resource: "union-committee-members", values: payload }, { onSuccess: () => navigate(backTo) });
    } else if (id) {
      updateCm({ resource: "union-committee-members", id, values: payload }, { onSuccess: () => navigate(backTo) });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        {mode === "create" ? "Thêm thành viên Ban chấp hành" : "Sửa thành viên Ban chấp hành"}
      </h1>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="termId">Nhiệm kỳ</Label>
              <Select value={termId || undefined} onValueChange={setTermId} disabled={termsLoading}>
                <SelectTrigger id="termId">
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
            </div>

            <div className="grid gap-2">
              <Label>Công đoàn viên</Label>
              {selectedMember ? (
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <div className="font-medium">{selectedMember.fullName}</div>
                    {selectedMember.degreeLabel ? (
                      <div className="text-sm text-muted-foreground">{selectedMember.degreeLabel}</div>
                    ) : null}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedMember(null)}>
                    Đổi
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Gõ họ tên để tìm công đoàn viên..."
                    value={memberSearchInput}
                    onChange={(event) => setMemberSearchInput(event.target.value)}
                  />
                  {memberSearchLoading && <p className="text-sm text-muted-foreground">Đang tìm...</p>}
                  {!memberSearchLoading && debouncedMemberSearch && memberSearchResults.length === 0 && (
                    <p className="text-sm text-muted-foreground">Không tìm thấy công đoàn viên nào khớp.</p>
                  )}
                  {memberSearchResults.length > 0 && (
                    <div className="flex flex-col gap-1 rounded-md border">
                      {memberSearchResults.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className="flex flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent"
                          onClick={() => {
                            setSelectedMember({ id: m.id, fullName: m.fullName, photoUrl: m.photoUrl, degreeLabel: m.degreeLabel });
                            setMemberSearchInput("");
                          }}
                        >
                          <span className="font-medium">{m.fullName}</span>
                          {m.department ? <span className="text-muted-foreground">{m.department.name}</span> : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="departmentId">Cấp</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="departmentId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SCHOOL_LEVEL_VALUE}>Cấp trường</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="positionTitle">Chức vụ Ban chấp hành</Label>
                <Input
                  id="positionTitle"
                  required
                  placeholder="Chủ tịch, Phó Chủ tịch, Uỷ viên..."
                  value={positionTitle}
                  onChange={(event) => setPositionTitle(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                <Input id="sortOrder" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
              <Textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(`/union-committee-members?termId=${termId}`)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving || !termId || !selectedMember || !positionTitle}>
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
