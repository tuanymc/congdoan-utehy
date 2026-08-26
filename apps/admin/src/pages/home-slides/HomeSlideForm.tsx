import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { CreateHomeSlideRequest, HomeBannerPlacement, HomeSlideDto } from "@congdoan/types";
import { HOME_BANNER_PLACEMENTS, HOME_BANNER_PLACEMENT_LABELS } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ImageUploadField } from "../../components/common/ImageUploadField";
import { PageLoading } from "../../components/common/PageLoading";

interface HomeSlideFormProps {
  mode: "create" | "edit";
}

/** Dùng chung cho tạo mới và chỉnh sửa banner trang chủ — điều khiển bởi prop `mode`. imageUrl nhập
 * tay đường dẫn tương đối (vd "/upload/images/slide1.jpg") — chưa có upload file trực tiếp qua admin
 * ở bản MVP này, ảnh cần copy sẵn vào thư mục upload trên server (giống ảnh bài viết). */
export function HomeSlideForm({ mode }: HomeSlideFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: slideResult, isLoading: slideLoading } = useOne<HomeSlideDto>({
    resource: "home-slides",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createSlide, isLoading: isCreating } = useCreate();
  const { mutate: updateSlide, isLoading: isUpdating } = useUpdate();

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState<"true" | "false">("true");
  const [placement, setPlacement] = useState<HomeBannerPlacement>("SLIDER");

  useEffect(() => {
    if (mode === "edit" && slideResult?.data) {
      const slide = slideResult.data;
      setName(slide.name);
      setImageUrl(slide.imageUrl);
      setLinkUrl(slide.linkUrl ?? "");
      setSortOrder(String(slide.sortOrder));
      setIsActive(slide.isActive ? "true" : "false");
      setPlacement(slide.placement ?? "SLIDER");
    }
  }, [mode, slideResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && slideLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageUrl.trim()) return;

    const payload: CreateHomeSlideRequest = {
      name,
      imageUrl,
      linkUrl: linkUrl.trim() || undefined,
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive === "true",
      placement
    };

    if (mode === "create") {
      createSlide({ resource: "home-slides", values: payload }, { onSuccess: () => navigate("/home-slides") });
    } else if (id) {
      updateSlide({ resource: "home-slides", id, values: payload }, { onSuccess: () => navigate("/home-slides") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm banner" : "Sửa banner"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Tên banner</Label>
              <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
            </div>

            <ImageUploadField
              id="imageUrl"
              label="Ảnh banner"
              value={imageUrl}
              onChange={setImageUrl}
              placeholder="/upload/images/slide1.jpg"
            />

            <div className="grid gap-2">
              <Label htmlFor="linkUrl">Liên kết khi bấm vào ảnh (không bắt buộc)</Label>
              <Input id="linkUrl" placeholder="/tin-tuc/xyz" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="placement">Vị trí trên trang chủ</Label>
              <Select value={placement} onValueChange={(value) => setPlacement(value as HomeBannerPlacement)}>
                <SelectTrigger id="placement">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOME_BANNER_PLACEMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {HOME_BANNER_PLACEMENT_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Slider đầu trang trượt tự động. "Dưới slide" hiện ngay sau slider. "Trên footer" hiện cuối trang chủ.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isActive">Trạng thái</Label>
              <Select value={isActive} onValueChange={(value) => setIsActive(value as "true" | "false")}>
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Đang hiển thị</SelectItem>
                  <SelectItem value="false">Đang ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/home-slides")}>
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
