import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useList, useOne, useUpdate } from "@refinedev/core";
import type { CreateUnionMemberRequest, UnionDepartmentDto, UnionMemberListItemDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface UnionMemberFormProps {
  mode: "create" | "edit";
}

const NO_DEPARTMENT_VALUE = "__none__";

export function UnionMemberForm({ mode }: UnionMemberFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: deptsResult, isLoading: deptsLoading } = useList<UnionDepartmentDto>({ resource: "union-departments" });
  const { data: memberResult, isLoading: memberLoading } = useOne<UnionMemberListItemDto>({
    resource: "union-members",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createMember, isLoading: isCreating } = useCreate();
  const { mutate: updateMember, isLoading: isUpdating } = useUpdate();

  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [degreeLabel, setDegreeLabel] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState<string>(NO_DEPARTMENT_VALUE);
  const [sortOrder, setSortOrder] = useState("0");
  const [isPublic, setIsPublic] = useState<"true" | "false">("true");

  useEffect(() => {
    if (mode === "edit" && memberResult?.data) {
      const member = memberResult.data;
      setFullName(member.fullName);
      setPhotoUrl(member.photoUrl ?? "");
      setDegreeLabel(member.degreeLabel ?? "");
      setPositionTitle(member.positionTitle ?? "");
      setPhone(member.phone ?? "");
      setEmail(member.email ?? "");
      setDepartmentId(member.department?.id ?? NO_DEPARTMENT_VALUE);
      setSortOrder(String(member.sortOrder));
      setIsPublic(member.isPublic ? "true" : "false");
    }
  }, [mode, memberResult]);

  const departments = deptsResult?.data ?? [];
  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && memberLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateUnionMemberRequest = {
      fullName,
      photoUrl: photoUrl.trim() || undefined,
      degreeLabel: degreeLabel.trim() || undefined,
      positionTitle: positionTitle.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      departmentId: departmentId === NO_DEPARTMENT_VALUE ? undefined : departmentId,
      sortOrder: Number(sortOrder) || 0,
      isPublic: isPublic === "true"
    };

    if (mode === "create") {
      createMember({ resource: "union-members", values: payload }, { onSuccess: () => navigate("/union-members") });
    } else if (id) {
      updateMember({ resource: "union-members", id, values: payload }, { onSuccess: () => navigate("/union-members") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm công đoàn viên" : "Sửa công đoàn viên"}</h1>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input id="fullName" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="photoUrl">Ảnh đại diện (đường dẫn, không bắt buộc)</Label>
              <Input
                id="photoUrl"
                placeholder="/upload/images/AnhCDV/xxx.jpg"
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="degreeLabel">Trình độ chuyên môn cao nhất</Label>
                <Input id="degreeLabel" value={degreeLabel} onChange={(event) => setDegreeLabel(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="positionTitle">Chức vụ</Label>
                <Input id="positionTitle" value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Điện thoại</Label>
                <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="departmentId">Công đoàn bộ phận</Label>
              <Select value={departmentId} onValueChange={setDepartmentId} disabled={deptsLoading}>
                <SelectTrigger id="departmentId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DEPARTMENT_VALUE}>Không thuộc bộ phận nào</SelectItem>
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
                <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                <Input id="sortOrder" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isPublic">Trạng thái</Label>
                <Select value={isPublic} onValueChange={(value) => setIsPublic(value as "true" | "false")}>
                  <SelectTrigger id="isPublic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Đang hiển thị</SelectItem>
                    <SelectItem value="false">Đang ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/union-members")}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
