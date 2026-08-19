import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import type { PaginatedResult, UnionDepartmentDto, UnionMemberListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 24;

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  return last.slice(0, 1).toUpperCase() || "?";
}

/** Trang "Công đoàn viên" công khai (thay modules/GioiThieuCongDoanVien.aspx web cũ) — danh bạ công
 * khai, CHỈ hiển thị 6 field không nhạy cảm (xem UnionMemberListItemDto trong @congdoan/types và chú
 * thích domain block UNIONDIRECTORY trong prisma/schema.prisma). Khác /cong-doan-vien (Cổng đoàn viên
 * — yêu cầu đăng nhập), trang này công khai cho mọi người xem. */
export function UnionMembersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const departmentId = searchParams.get("department") ?? "";

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [departments, setDepartments] = useState<UnionDepartmentDto[]>([]);
  const [result, setResult] = useState<PaginatedResult<UnionMemberListItemDto> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<UnionDepartmentDto[]>("/union-departments")
      // "?? []" phòng apiFetch trả về null — departments.map bên dưới không tự chống null.
      .then((data) => setDepartments(data ?? []))
      .catch(() => {
        // Không chặn trang khi lỗi tải bộ phận — chỉ ẩn bộ lọc.
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      setSearchParams(params, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi searchInput đổi (debounce); cố tình không phụ thuộc searchParams/setSearchParams để tránh vòng lặp (searchParams đổi sau mỗi lần set).
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setResult(null);

    const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    const search = searchParams.get("search") ?? "";
    if (search) query.set("search", search);
    if (departmentId) query.set("departmentId", departmentId);

    apiFetch<PaginatedResult<UnionMemberListItemDto>>(`/union-members?${query.toString()}`)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải danh bạ Công đoàn viên.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams đọc trực tiếp field "search" bên trong, không cần liệt kê cả object.
  }, [page, departmentId, searchParams.get("search")]);

  function selectDepartment(next: string) {
    const params = new URLSearchParams(searchParams);
    if (next) {
      params.set("department", next);
    } else {
      params.delete("department");
    }
    params.delete("page");
    setSearchParams(params);
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Công đoàn viên</h1>
      <p className="mt-2 text-muted-foreground">
        Danh bạ công khai cán bộ, giảng viên, người lao động là đoàn viên Công đoàn Trường.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Tìm theo họ tên..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full max-w-sm rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        />
        <select
          value={departmentId}
          onChange={(event) => selectDepartment(event.target.value)}
          className="w-full max-w-sm rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        >
          <option value="">Tất cả công đoàn bộ phận</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : result === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : result.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không tìm thấy công đoàn viên nào phù hợp.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((member) => (
                <Card key={member.id}>
                  <CardContent className="flex items-start gap-3 py-4">
                    <Avatar className="size-14 shrink-0">
                      {member.photoUrl ? <AvatarImage src={member.photoUrl} alt={member.fullName} /> : null}
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{member.fullName}</p>
                      {member.positionTitle ? (
                        <p className="text-xs text-muted-foreground">{member.positionTitle}</p>
                      ) : null}
                      {member.degreeLabel ? (
                        <p className="text-xs text-muted-foreground">{member.degreeLabel}</p>
                      ) : null}
                      {member.department ? (
                        <p className="mt-1 text-xs text-muted-foreground">{member.department.name}</p>
                      ) : null}
                      <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                        {member.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone className="size-3 shrink-0" />
                            {member.phone}
                          </span>
                        ) : null}
                        {member.email ? (
                          <span className="flex items-center gap-1.5 truncate">
                            <Mail className="size-3 shrink-0" />
                            {member.email}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {result.totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {result.page} / {result.totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= result.totalPages} onClick={() => goToPage(page + 1)}>
                  Sau
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
