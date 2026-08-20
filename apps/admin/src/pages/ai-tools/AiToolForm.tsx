import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { AiToolResourceDto, CreateAiToolResourceRequest } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface AiToolFormProps {
  mode: "create" | "edit";
}

/** Dùng chung cho tạo mới và chỉnh sửa công cụ AI — theo đúng khuôn CategoryForm.tsx/HomeSlideForm.tsx. */
export function AiToolForm({ mode }: AiToolFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: toolResult, isLoading: toolLoading } = useOne<AiToolResourceDto>({
    resource: "ai-tools",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createTool, isLoading: isCreating } = useCreate();
  const { mutate: updateTool, isLoading: isUpdating } = useUpdate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState<"true" | "false">("true");

  useEffect(() => {
    if (mode === "edit" && toolResult?.data) {
      const tool = toolResult.data;
      setName(tool.name);
      setDescription(tool.description ?? "");
      setUrl(tool.url);
      setCategory(tool.category ?? "");
      setLogoUrl(tool.logoUrl ?? "");
      setSortOrder(String(tool.sortOrder));
      setIsActive(tool.isActive ? "true" : "false");
    }
  }, [mode, toolResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && toolLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateAiToolResourceRequest = {
      name,
      description: description.trim() || undefined,
      url,
      category: category.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : undefined,
      isActive: isActive === "true"
    };

    if (mode === "create") {
      createTool({ resource: "ai-tools", values: payload }, { onSuccess: () => navigate("/ai-tools") });
    } else if (id) {
      updateTool({ resource: "ai-tools", id, values: payload }, { onSuccess: () => navigate("/ai-tools") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm công cụ AI" : "Sửa công cụ AI"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Tên công cụ</Label>
              <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Công cụ dùng để làm gì, phù hợp cho việc gì..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">Đường dẫn (URL)</Label>
              <Input
                id="url"
                type="url"
                required
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://chat.openai.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Phân loại</Label>
              <Input
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Vd: Soạn bài giảng, Nghiên cứu, Chấm điểm"
              />
              <p className="text-xs text-muted-foreground">Nhãn tự do, dùng để nhóm các công cụ ở trang công khai.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logoUrl">Ảnh logo (không bắt buộc)</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="/upload/images/logo-tool.png"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isActive">Hiển thị công khai</Label>
              <Select value={isActive} onValueChange={(value) => setIsActive(value as "true" | "false")}>
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có — hiện ở Kho công cụ AI cho đoàn viên đã đăng nhập</SelectItem>
                  <SelectItem value="false">Không — ẩn (nháp/đã ngừng dùng)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/ai-tools")}>
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
