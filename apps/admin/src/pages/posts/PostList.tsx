import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDelete, useTable } from "@refinedev/core";
import type { CrudFilter } from "@refinedev/core";
import type { PostListItemDto, PostStatus } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { ConfirmDeleteDialog } from "../../components/common/ConfirmDeleteDialog";

const STATUS_LABEL: Record<PostStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã đăng",
  ARCHIVED: "Lưu trữ"
};

const STATUS_BADGE_VARIANT: Record<PostStatus, "outline" | "default" | "secondary"> = {
  DRAFT: "outline",
  PUBLISHED: "default",
  ARCHIVED: "secondary"
};

const STATUS_OPTIONS: Array<{ value: PostStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "PUBLISHED", label: "Đã đăng" },
  { value: "ARCHIVED", label: "Lưu trữ" }
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function PostList() {
  const navigate = useNavigate();
  const { mutate: deletePost, isLoading: isDeleting } = useDelete();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<PostStatus | "ALL">("ALL");
  const [deleteTarget, setDeleteTarget] = useState<PostListItemDto | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { tableQueryResult, current, setCurrent, pageCount, setFilters } = useTable<PostListItemDto>({
    resource: "posts",
    pagination: { current: 1, pageSize: 10 }
  });

  useEffect(() => {
    const filters: CrudFilter[] = [];
    if (debouncedSearch) {
      filters.push({ field: "search", operator: "contains", value: debouncedSearch });
    }
    if (status !== "ALL") {
      filters.push({ field: "status", operator: "eq", value: status });
    }
    setFilters(filters, "replace");
  }, [debouncedSearch, status, setFilters]);

  const posts = tableQueryResult.data?.data ?? [];
  const total = tableQueryResult.data?.total ?? 0;
  const isLoading = tableQueryResult.isLoading;

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deletePost(
      { resource: "posts", id: deleteTarget.id },
      {
        onSuccess: () => setDeleteTarget(null)
      }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Bài viết</h1>
          <p className="text-muted-foreground">Tổng cộng {total} bài viết.</p>
        </div>
        <Button onClick={() => navigate("/posts/create")}>Thêm bài viết</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Tìm kiếm theo tiêu đề..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={status} onValueChange={(value) => setStatus(value as PostStatus | "ALL")}>
          <SelectTrigger className="sm:max-w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Chuyên mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Không có bài viết nào phù hợp.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-xs truncate font-medium">{post.title}</TableCell>
                  <TableCell>{post.category.name}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[post.status]}>{STATUS_LABEL[post.status]}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(post.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/posts/edit/${post.id}`)}>
                        Sửa
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(post)}>
                        Xoá
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setCurrent(current - 1)}>
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {current} / {pageCount}
          </span>
          <Button variant="outline" size="sm" disabled={current >= pageCount} onClick={() => setCurrent(current + 1)}>
            Sau
          </Button>
        </div>
      )}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="Xoá bài viết"
        description={`Bạn có chắc chắn muốn xoá bài viết "${deleteTarget?.title ?? ""}"? Hành động này không thể hoàn tác.`}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
