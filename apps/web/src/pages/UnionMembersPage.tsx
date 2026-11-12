import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Building2, GraduationCap, Lock, Mail, Phone, UserRound } from "lucide-react";
import type { PaginatedResult, UnionDepartmentDto, UnionMemberListItemDto } from "@congdoan/types";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 24;

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  return last.slice(0, 1).toUpperCase() || "?";
}

function MemberPortrait({ photoUrl, fullName }: { photoUrl: string | null; fullName: string }) {
  return (
    <div className="relative w-[5.75rem] shrink-0 sm:w-28">
      <div className="overflow-hidden rounded-lg bg-gradient-to-b from-primary/10 via-card to-secondary/30 shadow-[0_10px_28px_rgba(0,82,48,0.14)] ring-1 ring-primary/15">
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
        <div className="aspect-[3/4] bg-muted/40">
          {photoUrl ? (
            <img src={photoUrl} alt={fullName} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-semibold text-primary sm:text-3xl">
              {getInitials(fullName)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Trang danh bạ công khai. SĐT/email chỉ hiện khi đã đăng nhập (API ẩn với khách). */
export function UnionMembersPage() {
  const { isAuthenticated, isInitializing } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const departmentId = searchParams.get("department") ?? "";

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [departments, setDepartments] = useState<UnionDepartmentDto[]>([]);
  const [result, setResult] = useState<PaginatedResult<UnionMemberListItemDto> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<UnionDepartmentDto[]>("/union-departments")
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi searchInput đổi (debounce).
  }, [searchInput]);

  useEffect(() => {
    if (isInitializing) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams đọc field "search" bên trong.
  }, [page, departmentId, searchParams.get("search"), isInitializing, isAuthenticated]);

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
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-secondary/20 px-6 py-8 sm:px-8">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(255,204,41,0.28),transparent_65%)]" />
        <p className="relative text-sm font-medium text-primary">Danh bạ Công đoàn</p>
        <h1 className="relative mt-1 text-3xl font-bold tracking-tight">Công đoàn viên</h1>
        <p className="relative mt-2 max-w-2xl text-muted-foreground">
          Cán bộ, giảng viên, người lao động là đoàn viên Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên.
        </p>
        {!isAuthenticated && !isInitializing ? (
          <p className="relative mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="size-3.5" />
            Số điện thoại và email chỉ hiện sau khi{" "}
            <Link
              to="/dang-nhap"
              state={{ from: { pathname: "/danh-ba-cong-doan-vien" } }}
              className="font-medium text-primary hover:underline"
            >
              đăng nhập
            </Link>
            .
          </p>
        ) : null}
      </div>

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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : result.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không tìm thấy công đoàn viên nào phù hợp.</p>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((member) => (
                <article
                  key={member.id}
                  className="flex gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <MemberPortrait photoUrl={member.photoUrl} fullName={member.fullName} />
                  <div className="min-w-0 flex-1 py-0.5">
                    <h2 className="text-base font-semibold leading-snug tracking-tight text-foreground">
                      {member.fullName}
                    </h2>
                    {member.positionTitle ? (
                      <p className="mt-1 flex items-start gap-1.5 text-sm text-primary">
                        <UserRound className="mt-0.5 size-3.5 shrink-0" />
                        <span>{member.positionTitle}</span>
                      </p>
                    ) : null}
                    {member.degreeLabel ? (
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <GraduationCap className="mt-0.5 size-3.5 shrink-0" />
                        <span>{member.degreeLabel}</span>
                      </p>
                    ) : null}
                    {member.department ? (
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="mt-0.5 size-3.5 shrink-0" />
                        <span>{member.department.name}</span>
                      </p>
                    ) : null}

                    {member.contactVisible ? (
                      <div className="mt-3 space-y-1 border-t border-border/70 pt-2.5 text-xs">
                        {member.phone ? (
                          <a
                            href={`tel:${member.phone}`}
                            className="flex items-center gap-1.5 text-foreground/80 hover:text-primary"
                          >
                            <Phone className="size-3.5 shrink-0 text-primary" />
                            {member.phone}
                          </a>
                        ) : null}
                        {member.email ? (
                          <a
                            href={`mailto:${member.email}`}
                            className="flex items-center gap-1.5 truncate text-foreground/80 hover:text-primary"
                          >
                            <Mail className="size-3.5 shrink-0 text-primary" />
                            <span className="truncate">{member.email}</span>
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Lock className="size-3 shrink-0" />
                        Liên hệ sau khi đăng nhập
                      </p>
                    )}
                  </div>
                </article>
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
