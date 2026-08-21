import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useList, useOne, useUpdate } from "@refinedev/core";
import type { CategoryDto, CreatePostRequest, PostDetailDto, PostStatus } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";
import { RichTextEditor } from "../../components/common/RichTextEditor";
import { ImageUploadField } from "../../components/common/ImageUploadField";
import { pushToast } from "../../components/common/toast-store";
import { slugify } from "../../lib/slugify";

interface PostFormProps {
  mode: "create" | "edit";
}

const STATUS_ITEMS: Array<{ value: PostStatus; label: string }> = [
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Đã đăng" },
  { value: "ARCHIVED", label: "Lưu trữ" }
];

/** true nếu HTML từ TipTap không còn chữ/ảnh có nghĩa (chỉ còn thẻ rỗng). */
function isEmptyHtml(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim();
  return text.length === 0 && !/<img\b/i.test(html);
}

/** Dùng chung cho tạo mới và chỉnh sửa bài viết — điều khiển bởi prop `mode`. */
export function PostForm({ mode }: PostFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: categoriesResult, isLoading: categoriesLoading } = useList<CategoryDto>({ resource: "categories" });
  const { data: postResult, isLoading: postLoading } = useOne<PostDetailDto>({
    resource: "posts",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createPost, isLoading: isCreating } = useCreate();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<PostStatus>("DRAFT");

  useEffect(() => {
    if (mode === "edit" && postResult?.data) {
      const post = postResult.data;
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt ?? "");
      setContent(post.content);
      setCategoryId(post.category.id);
      setCoverImageUrl(post.coverImageUrl ?? "");
      setStatus(post.status);
    }
  }, [mode, postResult]);

  const categories = categoriesResult?.data ?? [];
  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && postLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isEmptyHtml(content)) {
      pushToast({ variant: "error", message: "Vui lòng nhập nội dung bài viết." });
      return;
    }

    const payload: CreatePostRequest = {
      title,
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      content,
      categoryId,
      coverImageUrl: coverImageUrl.trim() || undefined,
      status
    };

    if (mode === "create") {
      createPost(
        { resource: "posts", values: payload },
        { onSuccess: () => navigate("/posts") }
      );
    } else if (id) {
      updatePost(
        { resource: "posts", id, values: payload },
        { onSuccess: () => navigate("/posts") }
      );
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm bài viết" : "Sửa bài viết"}</h1>

      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Đường dẫn (slug)</Label>
              <Input
                id="slug"
                placeholder={slugify(title) || "vi-du-duong-dan-bai-viet"}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Để trống để hệ thống tự sinh từ tiêu đề khi lưu.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excerpt">Tóm tắt</Label>
              <Textarea id="excerpt" rows={2} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Nội dung</Label>
              <RichTextEditor id="content" value={content} onChange={setContent} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Chuyên mục</Label>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={categoriesLoading}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Chọn chuyên mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as PostStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ImageUploadField
              id="coverImageUrl"
              label="Ảnh bìa"
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              placeholder="/upload/images/..."
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/posts")}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving || !categoryId}>
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
