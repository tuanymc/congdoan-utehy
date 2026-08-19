import { Link } from "react-router-dom";
import { Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              CĐ
            </span>
            <span className="font-bold text-primary">Công đoàn UTEHY</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên — tổ chức đại diện, bảo vệ quyền và
            lợi ích hợp pháp, chính đáng của cán bộ, giảng viên, người lao động nhà trường.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Liên kết nhanh</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/tin-tuc" className="hover:text-primary">
                Tin tức
              </Link>
            </li>
            <li>
              <Link to="/gioi-thieu" className="hover:text-primary">
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link to="/van-ban" className="hover:text-primary">
                Văn bản
              </Link>
            </li>
            <li>
              <Link to="/danh-ba-cong-doan-vien" className="hover:text-primary">
                Công đoàn viên
              </Link>
            </li>
            <li>
              <Link to="/lien-he" className="hover:text-primary">
                Liên hệ
              </Link>
            </li>
            <li>
              <Link to="/cong-doan-vien" className="hover:text-primary">
                Cổng đoàn viên
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Thông tin liên hệ</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>Xã Dân Tiến, Huyện Khoái Châu, Tỉnh Hưng Yên</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              <span>Hotline: 0962.490.411 — VP: 03123.713.108</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              <span>congdoanutehy@gmail.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Giờ hành chính</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Thứ Hai – Thứ Sáu: 7h30 – 17h00</li>
            <li>Nghỉ trưa: 11h30 – 13h30</li>
            <li>Thứ Bảy, Chủ nhật: Nghỉ</li>
          </ul>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook Công đoàn UTEHY (placeholder)"
              className="text-muted-foreground hover:text-primary"
            >
              <Facebook className="size-5" />
            </a>
            <a
              href="#"
              aria-label="Youtube Công đoàn UTEHY (placeholder)"
              className="text-muted-foreground hover:text-primary"
            >
              <Youtube className="size-5" />
            </a>
          </div>
        </div>
      </div>

      <Separator />

      <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground">
        © {year} Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}
