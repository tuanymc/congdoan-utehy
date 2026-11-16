import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import type {
  DepartmentMemberScopeDto,
  PaginatedResult,
  UnionMemberListItemDto,
  UpdateDepartmentMemberRequest,
  UploadImageResponseDto
} from "@congdoan/types";
import { ImagePlus, Pencil, UsersRound } from "lucide-react";
import { apiFetch, apiFetchUpload } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const inputClassName =
  "w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  return last.slice(0, 1).toUpperCase() || "?";
}

/** Chủ tịch công đoàn bộ phận: xem và sửa đoàn viên thuộc bộ phận mình — không thêm, không xoá. */
export function DepartmentMembersPanel({ scope }: { scope: DepartmentMemberScopeDto }) {
  const soleDepartment = scope.departments.length === 1 ? scope.departments[0] : undefined;
  const [searchInput, setSearchInput] = useState("");
  const [departmentId, setDepartmentId] = useState(soleDepartment?.id ?? "");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<UnionMemberListItemDto> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<UnionMemberListItemDto | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      void load(1, searchInput, departmentId);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, departmentId]);

  async function load(nextPage: number, search: string, dept: string) {
    setError(null);
    const query = new URLSearchParams({ page: String(nextPage), pageSize: "20" });
    if (search.trim()) query.set("search", search.trim());
    if (dept) query.set("departmentId", dept);
    try {
      const data = await apiFetch<PaginatedResult<UnionMemberListItemDto>>(
        `/me/department-members?${query.toString()}`
      );
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách đoàn viên bộ phận.");
      setResult({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
    }
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    void load(nextPage, searchInput, departmentId);
  }

  const departmentLabel = soleDepartment
    ? soleDepartment.name
    : departmentId
      ? (scope.departments.find((d) => d.id === departmentId)?.name ?? "bộ phận đã chọn")
      : "các bộ phận bạn quản lý";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UsersRound className="size-5 text-primary" />
          Công đoàn bộ phận
        </CardTitle>
        <CardDescription>
          Xem và cập nhật hồ sơ đoàn viên thuộc {departmentLabel}. Không được thêm mới hoặc xoá.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo họ tên..."
            className={`${inputClassName} max-w-sm`}
          />
          {scope.departments.length > 1 ? (
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className={`${inputClassName} max-w-sm`}
            >
              <option value="">Tất cả bộ phận quản lý</option>
              {scope.departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {editing ? (
          <DepartmentMemberEditForm
            member={editing}
            onCancel={() => setEditing(null)}
            onSaved={(updated) => {
              setEditing(null);
              setResult((prev) =>
                prev
                  ? { ...prev, items: prev.items.map((item) => (item.id === updated.id ? updated : item)) }
                  : prev
              );
            }}
          />
        ) : null}

        {result === null ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : result.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có đoàn viên nào trong phạm vi quản lý.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Họ tên</th>
                  <th className="px-3 py-2 font-medium">Chức vụ</th>
                  <th className="px-3 py-2 font-medium">Liên hệ</th>
                  <th className="px-3 py-2 text-right font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-8 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
                          {item.photoUrl ? (
                            <img src={item.photoUrl} alt="" className="h-full w-full object-cover object-top" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-semibold text-primary">
                              {getInitials(item.fullName)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.degreeLabel ?? "—"}
                            {item.department ? ` · ${item.department.name}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{item.positionTitle ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <div>{item.phone || "—"}</div>
                      <div className="truncate">{item.email || "—"}</div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditing(item)}>
                        <Pencil className="mr-1 size-3.5" />
                        Sửa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result && result.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              Trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {result.page} / {result.totalPages} · {result.total} người
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= result.totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Sau
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DepartmentMemberEditForm({
  member,
  onCancel,
  onSaved
}: {
  member: UnionMemberListItemDto;
  onCancel: () => void;
  onSaved: (member: UnionMemberListItemDto) => void;
}) {
  const [fullName, setFullName] = useState(member.fullName);
  const [phone, setPhone] = useState(member.phone ?? "");
  const [email, setEmail] = useState(member.email ?? "");
  const [positionTitle, setPositionTitle] = useState(member.positionTitle ?? "");
  const [degreeLabel, setDegreeLabel] = useState(member.degreeLabel ?? "");
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setFullName(member.fullName);
    setPhone(member.phone ?? "");
    setEmail(member.email ?? "");
    setPositionTitle(member.positionTitle ?? "");
    setDegreeLabel(member.degreeLabel ?? "");
    setPhotoUrl(member.photoUrl ?? "");
    setError(null);
    setSuccessMessage(null);
  }, [member]);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiFetchUpload<UploadImageResponseDto>("/me/union-member/photo", formData);
      setPhotoUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ảnh lên.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);
    try {
      const payload: UpdateDepartmentMemberRequest = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        positionTitle: positionTitle.trim(),
        degreeLabel: degreeLabel.trim(),
        photoUrl: photoUrl.trim() || undefined
      };
      const updated = await apiFetch<UnionMemberListItemDto>(`/me/department-members/${member.id}`, {
        method: "PATCH",
        body: payload
      });
      setSuccessMessage("Đã lưu thông tin đoàn viên.");
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4 rounded-lg border bg-muted/20 p-4" onSubmit={(event) => void handleSubmit(event)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Sửa hồ sơ: {member.fullName}</h3>
          <p className="text-xs text-muted-foreground">Công đoàn bộ phận không đổi tại đây.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Đóng
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-24 w-[4.5rem] overflow-hidden rounded-lg bg-muted ring-1 ring-primary/15">
          {photoUrl ? (
            <img src={photoUrl} alt={fullName} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full items-center justify-center text-lg font-semibold text-primary">
              {getInitials(fullName)}
            </div>
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ImagePlus className="size-4" />
          {isUploading ? "Đang tải ảnh..." : "Chọn ảnh"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => void handlePhotoChange(event)}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="dept-member-name" className="text-sm font-medium">
            Họ và tên
          </label>
          <input
            id="dept-member-name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="dept-member-phone" className="text-sm font-medium">
            Số điện thoại
          </label>
          <input
            id="dept-member-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="dept-member-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="dept-member-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="dept-member-position" className="text-sm font-medium">
            Chức vụ
          </label>
          <input
            id="dept-member-position"
            value={positionTitle}
            onChange={(event) => setPositionTitle(event.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="dept-member-degree" className="text-sm font-medium">
            Trình độ
          </label>
          <input
            id="dept-member-degree"
            value={degreeLabel}
            onChange={(event) => setDegreeLabel(event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
