import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { CreateUnionDepartmentRequest, UnionDepartmentDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { PageLoading } from "../../components/common/PageLoading";

interface UnionDepartmentFormProps {
  mode: "create" | "edit";
}

export function UnionDepartmentForm({ mode }: UnionDepartmentFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: deptResult, isLoading: deptLoading } = useOne<UnionDepartmentDto>({
    resource: "union-departments",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createDept, isLoading: isCreating } = useCreate();
  const { mutate: updateDept, isLoading: isUpdating } = useUpdate();

  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    if (mode === "edit" && deptResult?.data) {
      setName(deptResult.data.name);
      setSortOrder(String(deptResult.data.sortOrder));
    }
  }, [mode, deptResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && deptLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: CreateUnionDepartmentRequest = { name, sortOrder: Number(sortOrder) || 0 };

    if (mode === "create") {
      createDept({ resource: "union-departments", values: payload }, { onSuccess: () => navigate("/union-departments") });
    } else if (id) {
      updateDept({ resource: "union-departments", id, values: payload }, { onSuccess: () => navigate("/union-departments") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm công đoàn bộ phận" : "Sửa công đoàn bộ phận"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Tên bộ phận</Label>
              <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
              <Input id="sortOrder" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/union-departments")}>
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
