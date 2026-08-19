import { type FormEvent, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO(Phase sau): nối API POST /contact (chưa có trong apps/api hiện tại).
    // Hiện chỉ hiển thị thông báo xác nhận tạm thời phía client, KHÔNG gửi dữ liệu đi đâu cả.
    setSubmitted(true);
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
                <p className="text-muted-foreground">
                  Số 39A Nguyễn Văn Linh, phường Hiến Nam, tỉnh Hưng Yên
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Điện thoại</p>
                <p className="text-muted-foreground">[Số điện thoại Văn phòng Công đoàn]</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">congdoan@utehy.edu.vn</p>
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
                Cảm ơn bạn đã gửi phản ánh. Đây hiện là bản demo — biểu mẫu chưa được nối API, Công
                đoàn trường sẽ bổ sung tính năng tiếp nhận trực tuyến ở giai đoạn sau.
              </p>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
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
                <Button type="submit" className="w-full">
                  Gửi phản ánh
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
