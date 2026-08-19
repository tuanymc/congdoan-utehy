import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { CreateUserRequest, RoleDto, UpdateUserRequest, UserDetailDto } from "@congdoan/types";
import { apiFetch } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface UserFormProps {
  mode: "create" | "edit";
}

/** Dùng chung cho tạo mới và chỉnh sửa người dùng — điều khiển bởi prop `mode`. Chỉ ADMIN truy cập được (xem RequireAdmin). */
export function UserForm({ mode }: UserFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: userResult, isLoading: userLoading } = useOne<UserDetailDto>({
    resource: "users",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createUser, isLoading: isCreating } = useCreate();
  const { mutate: updateUser, isLoading: isUpdating } = useUpdate();

  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [roleIds, setRoleIds] = useState<string[]>([]);

  // GET /users/roles không phải một resource CRUD nên gọi thẳng qua api-client thay vì dataProvider.
  useEffect(() => {
    let cancelled = false;
    apiFetch<RoleDto[]>("/users/roles")
      .then((result) => {
        if (!cancelled) setRoles(result);
      })
      .finally(() => {
        if (!cancelled) setRolesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode === "edit" && userResult?.data) {
      const user = userResult.data;
      setEmail(user.email);
      setFullName(user.fullName);
      setIsActive(user.isActive);
      setRoleIds(user.roles.map((role) => role.id));
    }
  }, [mode, userResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && userLoading;

  function toggleRole(roleId: string, checked: boolean) {
    setRoleIds((prev) => (checked ? [...prev, roleId] : prev.filter((r) => r !== roleId)));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "create") {
      const payload: CreateUserRequest = { email, fullName, password, roleIds };
      createUser({ resource: "users", values: payload }, { onSuccess: () => navigate("/users") });
    } else if (id) {
      const payload: UpdateUserRequest = { fullName, isActive, roleIds };
      updateUser({ resource: "users", id, values: payload }, { onSuccess: () => navigate("/users") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm người dùng" : "Sửa người dùng"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                disabled={mode === "edit"}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {mode === "edit" && <p className="text-xs text-muted-foreground">Không thể đổi email sau khi tạo tài khoản.</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </div>

            {mode === "create" && (
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            )}

            {mode === "edit" && (
              <div className="grid gap-2">
                <Label htmlFor="isActive">Trạng thái tài khoản</Label>
                <Select value={isActive ? "active" : "inactive"} onValueChange={(value) => setIsActive(value === "active")}>
                  <SelectTrigger id="isActive">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Đã khoá</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Vai trò</Label>
              {rolesLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải danh sách vai trò...</p>
              ) : (
                <div className="flex flex-col gap-2 rounded-md border p-3">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input accent-primary"
                        checked={roleIds.includes(role.id)}
                        onChange={(event) => toggleRole(role.id, event.target.checked)}
                      />
                      <span className="font-medium">{role.name}</span>
                      {role.description && <span className="text-muted-foreground">— {role.description}</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/users")}>
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
