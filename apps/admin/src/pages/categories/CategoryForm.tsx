import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { CategoryDto, CreateCategoryRequest } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";
import { slugify } from "../../lib/slugify";

interface CategoryFormProps {
  mode: "create" | "edit";
}

/** Dùng chung cho tạo mới và chỉnh sửa chuyên mục — điều khiển bởi prop `mode`. */
export function CategoryForm({ mode }: CategoryFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: categoryResult, isLoading: categoryLoading } = useOne<CategoryDto>({
    resource: "categories",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createCategory, isLoading: isCreating } = useCreate();
  const { mutate: updateCategory, isLoading: isUpdating } = useUpdate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isAboutSection, setIsAboutSection] = useState<"true" | "false">("false");
  const [showInMenu, setShowInMenu] = useState<"true" | "false">("true");

  useEffect(() => {
    if (mode === "edit" && categoryResult?.data) {
      const category = categoryResult.data;
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description ?? "");
      setSortOrder(String(category.sortOrder));
      setIsAboutSection(category.isAboutSection ? "true" : "false");
      setShowInMenu(category.showInMenu ? "true" : "false");
    }
  }, [mode, categoryResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && categoryLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateCategoryRequest = {
      name,
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : undefined,
      isAboutSection: isAboutSection === "true",
      showInMenu: showInMenu === "true"
    };

    if (mode === "create") {
      createCategory(
        { resource: "categories", values: payload },
        { onSuccess: () => navigate("/categories") }
      );
    } else if (id) {
      updateCategory(
        { resource: "categories", id, values: payload },
        { onSuccess: () => navigate("/categories") }
      );
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm chuyên mục" : "Sửa chuyên mục"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Tên chuyên mục</Label>
              <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Đường dẫn (slug)</Label>
              <Input
                id="slug"
                placeholder={slugify(name) || "vi-du-chuyen-muc"}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Để trống để hệ thống tự sinh từ tên khi lưu.</p>
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
              <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isAboutSection">Thuộc trang "Giới thiệu"</Label>
              <Select value={isAboutSection} onValueChange={(value) => setIsAboutSection(value as "true" | "false")}>
                <SelectTrigger id="isAboutSection">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Không — hiển thị như chuyên mục tin tức bình thường</SelectItem>
                  <SelectItem value="true">Có — gom bài viết chuyên mục này vào trang Giới thiệu</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Dùng cho các chuyên mục dạng "Giới thiệu chung", "Ban chấp hành"... — apps/web sẽ gom bài viết
                các chuyên mục này vào trang Giới thiệu thay vì trang Tin tức.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="showInMenu">Hiện trong menu chính</Label>
              <Select value={showInMenu} onValueChange={(value) => setShowInMenu(value as "true" | "false")}>
                <SelectTrigger id="showInMenu">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có — hiện trong dropdown "Tin hoạt động"</SelectItem>
                  <SelectItem value="false">Không — ẩn khỏi menu (bài viết vẫn xem được bình thường)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Chỉ ẩn/hiện MỤC MENU trỏ tới chuyên mục này — không ảnh hưởng tới việc bài viết có hiển thị ở
                trang Tin tức hay không. Có thể bấm ẩn/hiện nhanh ngay ở trang danh sách Chuyên mục.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/categories")}>
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
