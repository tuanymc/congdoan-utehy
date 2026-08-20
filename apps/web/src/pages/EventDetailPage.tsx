import { type FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import type { CreateEventRegistrationRequest, PublicEventDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(iso: string | null): string {
  if (!iso) return "Chưa có lịch cụ thể";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/** Chi tiết 1 hoạt động + form đăng ký tham gia — công khai, không cần đăng nhập (khớp
 * PublicEventsController.register(), xem EventsService.register() cho các điều kiện chặn: hết hạn đăng
 * ký / đủ số lượng / email đã đăng ký rồi). */
export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [eventItem, setEventItem] = useState<PublicEventDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadError(null);
    setEventItem(null);

    apiFetch<PublicEventDto>(`/events/${id}`)
      .then((data) => {
        if (!cancelled) setEventItem(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Không tìm thấy hoạt động này.");
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setSubmitError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: CreateEventRegistrationRequest = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      note: String(formData.get("note") ?? "").trim() || undefined
    };

    setIsSubmitting(true);
    try {
      await apiFetch(`/events/${id}/register`, { method: "POST", body: payload });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Không thể gửi đăng ký lúc này, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-destructive">{loadError}</p>
        <Link to="/tien-ich-so-cong-doan/dang-ky-hoat-dong" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Quay lại danh sách hoạt động
        </Link>
      </div>
    );
  }

  if (!eventItem) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  const deadlinePassed = Boolean(eventItem.registrationDeadline && new Date() > new Date(eventItem.registrationDeadline));
  const registrationClosed = eventItem.isFull || deadlinePassed;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/tien-ich-so-cong-doan/dang-ky-hoat-dong" className="text-sm text-primary hover:underline">
        ← Quay lại danh sách hoạt động
      </Link>

      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{eventItem.title}</h1>

      <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4 shrink-0" />
          {formatDateTime(eventItem.startAt)}
          {eventItem.endAt ? ` – ${formatDateTime(eventItem.endAt)}` : ""}
        </span>
        {eventItem.location ? (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            {eventItem.location}
          </span>
        ) : null}
        {eventItem.registrationDeadline ? (
          <span>Hạn đăng ký: {formatDateTime(eventItem.registrationDeadline)}</span>
        ) : null}
      </div>

      {eventItem.description ? (
        <p className="mt-4 whitespace-pre-line rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          {eventItem.description}
        </p>
      ) : null}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Đăng ký tham gia</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-sm text-primary">
              Cảm ơn bạn đã đăng ký tham gia hoạt động này. Công đoàn trường sẽ liên hệ lại qua email/số điện
              thoại bạn đã để lại nếu cần thêm thông tin.
            </p>
          ) : registrationClosed ? (
            <Badge variant="secondary">
              {eventItem.isFull ? "Hoạt động đã đủ số lượng đăng ký" : "Đã hết hạn đăng ký hoạt động này"}
            </Badge>
          ) : (
            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <div className="space-y-1.5">
                <label htmlFor="event-fullName" className="text-sm font-medium">
                  Họ và tên
                </label>
                <input
                  id="event-fullName"
                  name="fullName"
                  required
                  className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="event-email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="event-email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                />
                <p className="text-xs text-muted-foreground">Mỗi email chỉ đăng ký được 1 lần cho hoạt động này.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="event-phone" className="text-sm font-medium">
                  Số điện thoại (không bắt buộc)
                </label>
                <input
                  id="event-phone"
                  name="phone"
                  className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="event-note" className="text-sm font-medium">
                  Ghi chú (không bắt buộc)
                </label>
                <textarea
                  id="event-note"
                  name="note"
                  rows={3}
                  className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
              {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Đăng ký tham gia"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
