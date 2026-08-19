import { type FormEvent, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import type { CreateContactMessageRequest } from "@congdoan/types";
import { apiFetch, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: CreateContactMessageRequest = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      message: String(formData.get("message") ?? "").trim()
    };

    setIsSubmitting(true);
    try {
      await apiFetch("/contact-messages", { method: "POST", body: payload });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể gửi phản ánh lúc này, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Liên hệ</h1>
      <p className="mt-2 text-muted-foreground">
        Mọi ý kiến, phản ánh, đề xuất xin gửi về Văn phòng Công đoàn trường.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin liên hệ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Địa chỉ</p>
                <p className="text-muted-foreground">Xã Dân Tiến, Huyện Khoái Châu, Tỉnh Hưng Yên</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Điện thoại</p>
                <p className="text-muted-foreground">Hotline: 0962.490.411</p>
                <p className="text-muted-foreground">Văn phòng: 03123.713.108</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">congdoanutehy@gmail.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gửi phản ánh, góp ý</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <p className="text-sm text-primary">
                Cảm ơn bạn đã gửi phản ánh. Văn phòng Công đoàn trường sẽ xem và liên hệ lại qua email/số điện
                thoại bạn đã để lại trong thời gian sớm nhất.
              </p>
            ) : (
              <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-sm font-medium">
                    Họ và tên
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-sm font-medium">
                    Số điện thoại (không bắt buộc)
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="text-sm font-medium">
                    Nội dung
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    className="w-full rounded-md border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : "Gửi phản ánh"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
