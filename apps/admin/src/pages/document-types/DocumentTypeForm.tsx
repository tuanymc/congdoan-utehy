import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useList, useOne, useUpdate } from "@refinedev/core";
import type { CreateDocumentTypeRequest, DocumentTypeDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface DocumentTypeFormProps {
  mode: "create" | "edit";
}

const NO_PARENT_VALUE = "__none__";

/** Dùng chung cho tạo mới và chỉnh sửa loại công văn — điều khiển bởi prop `mode`. */
export function DocumentTypeForm({ mode }: DocumentTypeFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: typesResult, isLoading: typesLoading } = useList<DocumentTypeDto>({ resource: "document-types" });
  const { data: typeResult, isLoading: typeLoading } = useOne<DocumentTypeDto>({
    resource: "document-types",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createType, isLoading: isCreating } = useCreate();
  const { mutate: updateType, isLoading: isUpdating } = useUpdate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>(NO_PARENT_VALUE);

  useEffect(() => {
    if (mode === "edit" && typeResult?.data) {
      const type = typeResult.data;
      setName(type.name);
      setDescription(type.description ?? "");
      setParentId(type.parentId ?? NO_PARENT_VALUE);
    }
  }, [mode, typeResult]);

  // Không cho chọn chính nó làm loại cha.
  const parentOptions = (typesResult?.data ?? []).filter((type) => type.id !== id);
  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && typeLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateDocumentTypeRequest = {
      name,
      description: description.trim() || undefined,
      parentId: parentId === NO_PARENT_VALUE ? undefined : parentId
    };

    if (mode === "create") {
      createType(
        { resource: "document-types", values: payload },
        { onSuccess: () => navigate("/document-types") }
      );
    } else if (id) {
      updateType(
        { resource: "document-types", id, values: payload },
        { onSuccess: () => navigate("/document-types") }
      );
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm loại công văn" : "Sửa loại công văn"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Tên loại công văn</Label>
              <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parentId">Loại cha (nếu có)</Label>
              <Select value={parentId} onValueChange={setParentId} disabled={typesLoading}>
                <SelectTrigger id="parentId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PARENT_VALUE}>Không có loại cha</SelectItem>
                  {parentOptions.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/document-types")}>
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
