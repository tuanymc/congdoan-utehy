import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { UnionCommitteeMemberDto, UnionDepartmentDto, UnionTermDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Khớp SCHOOL_LEVEL_SENTINEL ở BE (union-committee-members.service.ts). */
const SCHOOL_LEVEL_VALUE = "__school__";
const ALL_LEVELS_VALUE = "";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  return last.slice(0, 1).toUpperCase() || "?";
}

function formatYearRange(term: UnionTermDto): string {
  if (term.startYear && term.endYear) return `${term.startYear} - ${term.endYear}`;
  if (term.startYear) return `Từ ${term.startYear}`;
  if (term.endYear) return `Đến ${term.endYear}`;
  return "";
}

interface CommitteeGroup {
  key: string;
  title: string;
  members: UnionCommitteeMemberDto[];
}

/** Nhóm theo cấp (Cấp trường trước, rồi từng bộ phận) — mỗi nhóm đã sắp xếp sẵn theo sortOrder (API
 * trả về đã orderBy sortOrder, xem UnionCommitteeMembersService.list). */
function groupByDepartment(members: UnionCommitteeMemberDto[]): CommitteeGroup[] {
  const schoolLevel = members.filter((m) => !m.department);
  const byDept = new Map<string, CommitteeGroup>();
  for (const m of members) {
    if (!m.department) continue;
    const existing = byDept.get(m.department.id);
    if (existing) {
      existing.members.push(m);
    } else {
      byDept.set(m.department.id, { key: m.department.id, title: m.department.name, members: [m] });
    }
  }
  const groups: CommitteeGroup[] = [];
  if (schoolLevel.length > 0) {
    groups.push({ key: "school", title: "Ban chấp hành Công đoàn Trường", members: schoolLevel });
  }
  groups.push(...byDept.values());
  return groups;
}

/** Trang công khai "Ban chấp hành Công đoàn" — danh sách CÓ CẤU TRÚC theo nhiệm kỳ (thay/bổ sung cho
 * các bài viết tĩnh "Ban Chấp hành Công đoàn trường nhiệm kỳ..." ở /gioi-thieu, xem AboutPage.tsx).
 * Dữ liệu nguồn NHIEMKY/NHANVIEN_NHIEMKY/tblPhongBan_NV_NK web cũ, nay quản lý qua trang quản trị
 * "Nhiệm kỳ Ban chấp hành"/"Ban chấp hành". */
export function UnionCommitteePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const termId = searchParams.get("nhiem-ky") ?? "";
  const levelFilter = searchParams.get("cap") ?? ALL_LEVELS_VALUE;

  const [terms, setTerms] = useState<UnionTermDto[] | null>(null);
  const [departments, setDepartments] = useState<UnionDepartmentDto[]>([]);
  const [members, setMembers] = useState<UnionCommitteeMemberDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<UnionTermDto[]>("/union-terms")
      .then((data) => setTerms(data ?? []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Không thể tải danh sách nhiệm kỳ."));
    apiFetch<UnionDepartmentDto[]>("/union-departments")
      .then((data) => setDepartments(data ?? []))
      .catch(() => {
        // Không chặn trang khi lỗi tải bộ phận — chỉ ẩn bộ lọc.
      });
  }, []);

  // Chưa có ?nhiem-ky= trên URL -> tự chọn nhiệm kỳ đương nhiệm, hoặc nhiệm kỳ đầu tiên.
  useEffect(() => {
    if (!termId && terms && terms.length > 0) {
      const defaultTerm = terms.find((t) => t.isCurrent) ?? terms[0];
      if (defaultTerm) {
        const params = new URLSearchParams(searchParams);
        params.set("nhiem-ky", defaultTerm.id);
        setSearchParams(params, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy lại khi termId/terms đổi, cố tình không phụ thuộc searchParams/setSearchParams để tránh vòng lặp.
  }, [termId, terms]);

  useEffect(() => {
    if (!termId) return;
    let cancelled = false;
    setError(null);
    setMembers(null);

    const query = new URLSearchParams({ termId });
    if (levelFilter) query.set("departmentId", levelFilter);

    apiFetch<UnionCommitteeMemberDto[]>(`/union-committee-members?${query.toString()}`)
      .then((data) => {
        if (!cancelled) setMembers(data ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải danh sách Ban chấp hành.");
      });

    return () => {
      cancelled = true;
    };
  }, [termId, levelFilter]);

  function selectTerm(nextTermId: string) {
    const params = new URLSearchParams(searchParams);
    params.set("nhiem-ky", nextTermId);
    setSearchParams(params);
  }

  function selectLevel(nextLevel: string) {
    const params = new URLSearchParams(searchParams);
    if (nextLevel) {
      params.set("cap", nextLevel);
    } else {
      params.delete("cap");
    }
    setSearchParams(params);
  }

  const selectedTerm = terms?.find((t) => t.id === termId) ?? null;
  const groups = members ? groupByDepartment(members) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Ban chấp hành Công đoàn</h1>
      <p className="mt-2 text-muted-foreground">
        Danh sách Ban chấp hành Công đoàn Trường và các công đoàn bộ phận theo từng nhiệm kỳ.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <select
          value={termId}
          onChange={(event) => selectTerm(event.target.value)}
          className="w-full max-w-sm rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        >
          {!terms || terms.length === 0 ? <option value="">Đang tải...</option> : null}
          {terms?.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
              {term.isCurrent ? " (đương nhiệm)" : ""}
            </option>
          ))}
        </select>
        <select
          value={levelFilter}
          onChange={(event) => selectLevel(event.target.value)}
          className="w-full max-w-sm rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        >
          <option value={ALL_LEVELS_VALUE}>Tất cả các cấp</option>
          <option value={SCHOOL_LEVEL_VALUE}>Cấp trường</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTerm ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {selectedTerm.name}
          {formatYearRange(selectedTerm) ? ` (${formatYearRange(selectedTerm)})` : ""}
          {selectedTerm.description ? ` — ${selectedTerm.description}` : ""}
        </p>
      ) : null}

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : members === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu Ban chấp hành cho nhiệm kỳ/cấp đã chọn.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group) => (
              <div key={group.key}>
                <h2 className="text-lg font-semibold">{group.title}</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.members.map((cm) => (
                    <Card key={cm.id}>
                      <CardContent className="flex items-start gap-3 py-4">
                        <Avatar className="size-14 shrink-0">
                          {cm.member.photoUrl ? <AvatarImage src={cm.member.photoUrl} alt={cm.member.fullName} /> : null}
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(cm.member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{cm.member.fullName}</p>
                          <p className="text-xs font-medium text-primary">{cm.positionTitle}</p>
                          {cm.member.degreeLabel ? (
                            <p className="text-xs text-muted-foreground">{cm.member.degreeLabel}</p>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
