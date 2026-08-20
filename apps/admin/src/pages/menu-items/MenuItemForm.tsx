import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useList, useOne, useUpdate } from "@refinedev/core";
import type { CreateMenuItemRequest, MenuItemDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface MenuItemFormProps {
  mode: "create" | "edit";
}

const TOP_LEVEL_VALUE = "__top_level__";

/** Dùng chung cho tạo mới và chỉnh sửa mục menu — điều khiển bởi prop `mode`. Menu chỉ hỗ trợ tối đa
 * 2 cấp (xem menu-items.service.ts#assertValidParent phía API): "Mục cha" chỉ liệt kê các mục CẤP 1
 * (parentId=null), trừ chính mục đang sửa; nếu mục đang sửa hiện đã có mục con, API sẽ từ chối khi cố
 * biến nó thành mục con của mục khác — lỗi này hiện ra qua toast (notification-provider), không chặn
 * ở form vì cần biết "mục nào đang có con" mà không muốn gọi thêm API riêng chỉ để kiểm tra trước. */
export function MenuItemForm({ mode }: MenuItemFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: allItemsResult, isLoading: allItemsLoading } = useList<MenuItemDto>({ resource: "menu-items" });
  const { data: itemResult, isLoading: itemLoading } = useOne<MenuItemDto>({
    resource: "menu-items",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createItem, isLoading: isCreating } = useCreate();
  const { mutate: updateItem, isLoading: isUpdating } = useUpdate();

  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [parentId, setParentId] = useState<string>(TOP_LEVEL_VALUE);
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState<"true" | "false">("true");
  const [autoCategoryChildren, setAutoCategoryChildren] = useState<"true" | "false">("false");

  useEffect(() => {
    if (mode === "edit" && itemResult?.data) {
      const item = itemResult.data;
      setLabel(item.label);
      setUrl(item.url);
      setParentId(item.parentId ?? TOP_LEVEL_VALUE);
      setSortOrder(String(item.sortOrder));
      setIsActive(item.isActive ? "true" : "false");
      setAutoCategoryChildren(item.autoCategoryChildren ? "true" : "false");
    }
  }, [mode, itemResult]);

  const allItems = allItemsResult?.data ?? [];
  // "Mục cha" chỉ chọn được trong số các mục CẤP 1 hiện có (parentId=null), không tính chính mục
  // đang sửa — khớp giới hạn "tối đa 2 cấp" ở API.
  const parentOptions = allItems.filter((item) => item.parentId === null && item.id !== id);

  const isTopLevel = parentId === TOP_LEVEL_VALUE;
  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = (mode === "edit" && itemLoading) || allItemsLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateMenuItemRequest = {
      label,
      url,
      parentId: isTopLevel ? null : parentId,
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive === "true",
      // Chỉ mục cấp 1 mới tự động thêm chuyên mục — ép về false khi là mục con để không cần dựa vào
      // validate phía API mới phát hiện ra (dù API vẫn kiểm tra lại, xem assertValidParent).
      autoCategoryChildren: isTopLevel && autoCategoryChildren === "true"
    };

    if (mode === "create") {
      createItem({ resource: "menu-items", values: payload }, { onSuccess: () => navigate("/menu-items") });
    } else if (id) {
      updateItem({ resource: "menu-items", id, values: payload }, { onSuccess: () => navigate("/menu-items") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm mục menu" : "Sửa mục menu"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="label">Nhãn hiển thị</Label>
              <Input id="label" required value={label} onChange={(event) => setLabel(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">Liên kết</Label>
              <Input
                id="url"
                required
                placeholder="/gioi-thieu hoặc /tin-tuc?category=van-hoa-doc"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Đường dẫn nội bộ trên trang công khai — bắt đầu bằng "/". Có thể kèm query (?category=...),
                hoặc neo tới 1 phần trong trang (#id).
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parentId">Mục cha</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="parentId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TOP_LEVEL_VALUE}>— Mục cấp 1 (không có mục cha) —</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isTopLevel ? (
              <div className="grid gap-2">
                <Label htmlFor="autoCategoryChildren">Tự động liệt kê chuyên mục</Label>
                <Select
                  value={autoCategoryChildren}
                  onValueChange={(value) => setAutoCategoryChildren(value as "true" | "false")}
                >
                  <SelectTrigger id="autoCategoryChildren">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Không</SelectItem>
                    <SelectItem value="true">Có — tự thêm các chuyên mục vào dropdown</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Bật để dropdown mục này tự động liệt kê thêm các Chuyên mục (Category) chưa gắn ở nơi
                  khác trong menu — vd mục "Tin hoạt động" hiện đang bật, để menu tự cập nhật khi thêm
                  chuyên mục mới mà không cần sửa menu thủ công.
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                    <SelectItem value="true">Đang hiện</SelectItem>
                    <SelectItem value="false">Đang ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/menu-items")}>
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
