import { type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HandHeart } from "lucide-react";
import type { CreatePublicServiceSupportRequestRequest, PublicServiceProcedureListItemDto } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OTHER_PROCEDURE = "__OTHER__";

/** Nhóm 4 ("Công đoàn hỗ trợ tôi") — PHẦN NỔI BẬT NHẤT theo yêu cầu người quản trị. Luồng đúng như đã
 * chốt: chọn "Tôi cần làm thủ tục gì?" → mô tả "Tôi đang vướng ở bước nào?" → gửi yêu cầu. KHÔNG bắt
 * buộc đăng nhập, cùng chính sách EventDetailPage (4b)/SurveyDetailPage (4d) — chỉ cần tên + số điện
 * thoại HOẶC email (xem PublicServiceSupportRequestsService.submit cho điều kiện bắt buộc phía BE). */
export function PublicServiceSupportPage() {
  const [searchParams] = useSearchParams();
  const prefilledProcedureId = searchParams.get("procedureId");

  const [procedures, setProcedures] = useState<PublicServiceProcedureListItemDto[]>([]);
  const [procedureId, setProcedureId] = useState<string>(prefilledProcedureId ?? OTHER_PROCEDURE);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PublicServiceProcedureListItemDto[]>("/public-service-procedures")
      .then((data) => setProcedures(data))
      .catch(() => setProcedures([]));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!phone && !email) {
      setError("Vui lòng để lại số điện thoại hoặc email để Công đoàn liên hệ lại.");
      return;
    }

    const payload: CreatePublicServiceSupportRequestRequest = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      phone: phone || undefined,
      email: email || undefined,
      procedureId: procedureId === OTHER_PROCEDURE ? undefined : procedureId,
      procedureOther: procedureId === OTHER_PROCEDURE ? String(formData.get("procedureOther") ?? "").trim() || undefined : undefined,
      stuckStep: String(formData.get("stuckStep") ?? "").trim() || undefined,
      description: String(formData.get("description") ?? "").trim() || undefined
    };

    setIsSubmitting(true);
    try {
      await apiFetch("/public-service-support-requests", { method: "POST", body: payload });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể gửi yêu cầu lúc này, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-2">
        <HandHeart className="size-6 text-primary" />
        <h1 className="text-3xl font-bold">Công đoàn hỗ trợ tôi</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Cho Công đoàn biết bạn cần làm thủ tục gì và đang vướng ở bước nào — cán bộ Công đoàn sẽ liên hệ hướng dẫn
        trực tiếp. Không cần đăng nhập.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Gửi yêu cầu hỗ trợ</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-sm text-primary">
              Cảm ơn bạn đã gửi yêu cầu. Công đoàn trường sẽ liên hệ lại qua số điện thoại/email bạn đã để lại
              trong thời gian sớm nhất.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <div className="space-y-1.5">
                <label htmlFor="support-fullName" className="text-sm font-medium">
                  Họ và tên
                </label>
                <input
                  id="support-fullName"
                  name="fullName"
                  required
                  className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="support-phone" className="text-sm font-medium">
                    Số điện thoại
                  </label>
                  <input
                    id="support-phone"
                    name="phone"
                    className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="support-email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="support-email"
                    name="email"
                    type="email"
                    className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
              </div>
              <p className="-mt-2 text-xs text-muted-foreground">Cần ít nhất 1 trong 2: số điện thoại hoặc email.</p>

              <div className="space-y-1.5">
                <label htmlFor="support-procedure" className="text-sm font-medium">
                  Tôi cần làm thủ tục gì?
                </label>
                <select
                  id="support-procedure"
                  value={procedureId}
                  onChange={(event) => setProcedureId(event.target.value)}
                  className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                >
                  {procedures.map((procedure) => (
                    <option key={procedure.id} value={procedure.id}>
                      {procedure.title}
                    </option>
                  ))}
                  <option value={OTHER_PROCEDURE}>Thủ tục khác (tự mô tả bên dưới)</option>
                </select>
              </div>

              {procedureId === OTHER_PROCEDURE ? (
                <div className="space-y-1.5">
                  <label htmlFor="support-procedureOther" className="text-sm font-medium">
                    Tên thủ tục (tự nhập)
                  </label>
                  <input
                    id="support-procedureOther"
                    name="procedureOther"
                    className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="support-stuckStep" className="text-sm font-medium">
                  Tôi đang vướng ở bước nào?
                </label>
                <textarea
                  id="support-stuckStep"
                  name="stuckStep"
                  rows={2}
                  className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                  placeholder="Vd: Không biết chuẩn bị hồ sơ gì, đăng ký online bị báo lỗi..."
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="support-description" className="text-sm font-medium">
                  Mô tả thêm (không bắt buộc)
                </label>
                <textarea
                  id="support-description"
                  name="description"
                  rows={3}
                  className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu hỗ trợ"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
