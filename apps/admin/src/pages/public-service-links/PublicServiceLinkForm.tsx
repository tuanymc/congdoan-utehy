import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { CreatePublicServiceLinkRequest, PublicServiceLinkDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface PublicServiceLinkFormProps {
  mode: "create" | "edit";
}

/** Dùng chung cho tạo mới và chỉnh sửa liên kết dịch vụ công — theo đúng khuôn AiToolForm.tsx. */
export function PublicServiceLinkForm({ mode }: PublicServiceLinkFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: itemResult, isLoading: itemLoading } = useOne<PublicServiceLinkDto>({
    resource: "public-service-links",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createItem, isLoading: isCreating } = useCreate();
  const { mutate: updateItem, isLoading: isUpdating } = useUpdate();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState<"true" | "false">("true");

  useEffect(() => {
    if (mode === "edit" && itemResult?.data) {
      const item = itemResult.data;
      setTitle(item.title);
      setUrl(item.url);
      setDescription(item.description ?? "");
      setGroup(item.group ?? "");
      setLogoUrl(item.logoUrl ?? "");
      setSortOrder(String(item.sortOrder));
      setIsActive(item.isActive ? "true" : "false");
    }
  }, [mode, itemResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && itemLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreatePublicServiceLinkRequest = {
      title,
      url,
      description: description.trim() || undefined,
      group: group.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : undefined,
      isActive: isActive === "true"
    };

    if (mode === "create") {
      createItem({ resource: "public-service-links", values: payload }, { onSuccess: () => navigate("/public-service-links") });
    } else if (id) {
      updateItem(
        { resource: "public-service-links", id, values: payload },
        { onSuccess: () => navigate("/public-service-links") }
      );
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm liên kết" : "Sửa liên kết"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">Đường dẫn (URL)</Label>
              <Input
                id="url"
                type="url"
                required
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://dichvucong.gov.vn"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="group">Nhóm</Label>
              <Input
                id="group"
                value={group}
                onChange={(event) => setGroup(event.target.value)}
                placeholder="Vd: Cổng Dịch vụ công Quốc gia, BHXH Việt Nam, Cơ quan thuế"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logoUrl">Ảnh logo (không bắt buộc)</Label>
              <Input id="logoUrl" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
              <Input id="sortOrder" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isActive">Hiển thị công khai</Label>
              <Select value={isActive} onValueChange={(value) => setIsActive(value as "true" | "false")}>
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có — hiện ở Kho biểu mẫu và đường dẫn chính thống</SelectItem>
                  <SelectItem value="false">Không — ẩn (nháp/link đã ngừng dùng)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/public-service-links")}>
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
