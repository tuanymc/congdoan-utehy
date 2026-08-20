import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import { PUBLIC_SERVICE_NOTICE_CATEGORIES, PUBLIC_SERVICE_NOTICE_CATEGORY_LABELS } from "@congdoan/types";
import type { CreatePublicServiceNoticeRequest, PublicServiceNoticeCategory, PublicServiceNoticeDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface PublicServiceNoticeFormProps {
  mode: "create" | "edit";
}

const NO_CATEGORY = "__NONE__";

/** Dùng chung cho tạo mới và chỉnh sửa thông báo "Cảnh báo và nhắc việc" — theo khuôn AiToolForm.tsx. */
export function PublicServiceNoticeForm({ mode }: PublicServiceNoticeFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: itemResult, isLoading: itemLoading } = useOne<PublicServiceNoticeDto>({
    resource: "public-service-notices",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createItem, isLoading: isCreating } = useCreate();
  const { mutate: updateItem, isLoading: isUpdating } = useUpdate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>(NO_CATEGORY);
  const [isPinned, setIsPinned] = useState<"true" | "false">("false");
  const [isActive, setIsActive] = useState<"true" | "false">("true");

  useEffect(() => {
    if (mode === "edit" && itemResult?.data) {
      const item = itemResult.data;
      setTitle(item.title);
      setContent(item.content);
      setCategory(item.category ?? NO_CATEGORY);
      setIsPinned(item.isPinned ? "true" : "false");
      setIsActive(item.isActive ? "true" : "false");
    }
  }, [mode, itemResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && itemLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreatePublicServiceNoticeRequest = {
      title,
      content,
      category: category === NO_CATEGORY ? undefined : (category as PublicServiceNoticeCategory),
      isPinned: isPinned === "true",
      isActive: isActive === "true"
    };

    if (mode === "create") {
      createItem(
        { resource: "public-service-notices", values: payload },
        { onSuccess: () => navigate("/public-service-notices") }
      );
    } else if (id) {
      updateItem(
        { resource: "public-service-notices", id, values: payload },
        { onSuccess: () => navigate("/public-service-notices") }
      );
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm thông báo" : "Sửa thông báo"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Nội dung</Label>
              <Textarea id="content" required rows={6} value={content} onChange={(event) => setContent(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Phân loại</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CATEGORY}>Không phân loại</SelectItem>
                  {PUBLIC_SERVICE_NOTICE_CATEGORIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {PUBLIC_SERVICE_NOTICE_CATEGORY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isPinned">Ghim lên đầu</Label>
              <Select value={isPinned} onValueChange={(value) => setIsPinned(value as "true" | "false")}>
                <SelectTrigger id="isPinned">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Không</SelectItem>
                  <SelectItem value="true">Có — thông báo quan trọng/khẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isActive">Hiển thị công khai</Label>
              <Select value={isActive} onValueChange={(value) => setIsActive(value as "true" | "false")}>
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có — hiện ở trang "Cảnh báo và nhắc việc"</SelectItem>
                  <SelectItem value="false">Không — ẩn (nháp/đã hết hiệu lực)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/public-service-notices")}>
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
