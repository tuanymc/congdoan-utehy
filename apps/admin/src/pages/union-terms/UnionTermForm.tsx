import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { CreateUnionTermRequest, UnionTermDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface UnionTermFormProps {
  mode: "create" | "edit";
}

export function UnionTermForm({ mode }: UnionTermFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: termResult, isLoading: termLoading } = useOne<UnionTermDto>({
    resource: "union-terms",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createTerm, isLoading: isCreating } = useCreate();
  const { mutate: updateTerm, isLoading: isUpdating } = useUpdate();

  const [name, setName] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [description, setDescription] = useState("");
  const [isCurrent, setIsCurrent] = useState<"true" | "false">("false");
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    if (mode === "edit" && termResult?.data) {
      const term = termResult.data;
      setName(term.name);
      setStartYear(term.startYear ? String(term.startYear) : "");
      setEndYear(term.endYear ? String(term.endYear) : "");
      setDescription(term.description ?? "");
      setIsCurrent(term.isCurrent ? "true" : "false");
      setSortOrder(String(term.sortOrder));
    }
  }, [mode, termResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && termLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: CreateUnionTermRequest = {
      name,
      startYear: startYear.trim() ? Number(startYear) : undefined,
      endYear: endYear.trim() ? Number(endYear) : undefined,
      description: description.trim() || undefined,
      isCurrent: isCurrent === "true",
      sortOrder: Number(sortOrder) || 0
    };

    if (mode === "create") {
      createTerm({ resource: "union-terms", values: payload }, { onSuccess: () => navigate("/union-terms") });
    } else if (id) {
      updateTerm({ resource: "union-terms", id, values: payload }, { onSuccess: () => navigate("/union-terms") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm nhiệm kỳ" : "Sửa nhiệm kỳ"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Tên nhiệm kỳ</Label>
              <Input
                id="name"
                required
                placeholder="Nhiệm kỳ 2023 - 2028"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startYear">Năm bắt đầu</Label>
                <Input id="startYear" type="number" value={startYear} onChange={(event) => setStartYear(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endYear">Năm kết thúc</Label>
                <Input id="endYear" type="number" value={endYear} onChange={(event) => setEndYear(event.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả (không bắt buộc)</Label>
              <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="isCurrent">Trạng thái</Label>
                <Select value={isCurrent} onValueChange={(value) => setIsCurrent(value as "true" | "false")}>
                  <SelectTrigger id="isCurrent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Đương nhiệm</SelectItem>
                    <SelectItem value="false">Đã qua</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Chỉ 1 nhiệm kỳ được đánh dấu "Đương nhiệm" — chọn nhiệm kỳ này sẽ tự động bỏ đánh dấu ở nhiệm
                  kỳ khác.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
                <Input id="sortOrder" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/union-terms")}>
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
