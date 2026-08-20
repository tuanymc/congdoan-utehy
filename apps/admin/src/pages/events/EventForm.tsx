import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useOne, useUpdate } from "@refinedev/core";
import type { CreateEventRequest, EventDetailDto } from "@congdoan/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PageLoading } from "../../components/common/PageLoading";

interface EventFormProps {
  mode: "create" | "edit";
}

/** Chuyển ISO datetime (từ API) sang định dạng "YYYY-MM-DDTHH:mm" mà input[type=datetime-local] cần —
 * dùng giờ địa phương của trình duyệt (không chuyển UTC) vì đây là giờ người dùng đã nhập lúc tạo. */
function isoToLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Dùng chung cho tạo mới và chỉnh sửa hoạt động — điều khiển bởi prop `mode`, theo đúng khuôn mẫu
 * CategoryForm.tsx/HomeSlideForm.tsx (state phẳng theo field, boolean dùng Select "true"/"false"). */
export function EventForm({ mode }: EventFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: eventResult, isLoading: eventLoading } = useOne<EventDetailDto>({
    resource: "events",
    id,
    queryOptions: { enabled: mode === "edit" && Boolean(id) }
  });
  const { mutate: createEvent, isLoading: isCreating } = useCreate();
  const { mutate: updateEvent, isLoading: isUpdating } = useUpdate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isPublic, setIsPublic] = useState<"true" | "false">("true");

  useEffect(() => {
    if (mode === "edit" && eventResult?.data) {
      const event = eventResult.data;
      setTitle(event.title);
      setDescription(event.description ?? "");
      setLocation(event.location ?? "");
      setStartAt(isoToLocalInputValue(event.startAt));
      setEndAt(isoToLocalInputValue(event.endAt));
      setRegistrationDeadline(isoToLocalInputValue(event.registrationDeadline));
      setCapacity(event.capacity != null ? String(event.capacity) : "");
      setIsPublic(event.isPublic ? "true" : "false");
    }
  }, [mode, eventResult]);

  const isSaving = isCreating || isUpdating;
  const isLoadingInitial = mode === "edit" && eventLoading;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // input[type=datetime-local] trả "YYYY-MM-DDTHH:mm" (không có giây/timezone) — new Date(...) coi
    // đây là giờ địa phương, .toISOString() chuyển đúng sang UTC trước khi gửi API (API validate bằng
    // @IsISO8601 — xem create-event.dto.ts).
    const payload: CreateEventRequest = {
      title,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startAt: startAt ? new Date(startAt).toISOString() : undefined,
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : undefined,
      capacity: capacity.trim() ? Number(capacity) : undefined,
      isPublic: isPublic === "true"
    };

    if (mode === "create") {
      createEvent({ resource: "events", values: payload }, { onSuccess: () => navigate("/events") });
    } else if (id) {
      updateEvent({ resource: "events", id, values: payload }, { onSuccess: () => navigate("/events") });
    }
  }

  if (isLoadingInitial) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{mode === "create" ? "Thêm hoạt động" : "Sửa hoạt động"}</h1>

      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">Tên hoạt động</Label>
              <Input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Địa điểm</Label>
              <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startAt">Bắt đầu</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={startAt}
                  onChange={(event) => setStartAt(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endAt">Kết thúc</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={endAt}
                  onChange={(event) => setEndAt(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registrationDeadline">Hạn đăng ký</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={registrationDeadline}
                onChange={(event) => setRegistrationDeadline(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Để trống nếu không giới hạn hạn đăng ký.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Số lượng tối đa</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Để trống nếu không giới hạn số lượng đăng ký.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="isPublic">Hiển thị công khai</Label>
              <Select value={isPublic} onValueChange={(value) => setIsPublic(value as "true" | "false")}>
                <SelectTrigger id="isPublic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có — hiện ở trang Tiện ích số, đoàn viên đăng ký được</SelectItem>
                  <SelectItem value="false">Không — ẩn, chỉ quản trị viên xem được (bản nháp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/events")}>
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
