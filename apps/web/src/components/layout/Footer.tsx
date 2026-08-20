import { Link } from "react-router-dom";
import { Clock, Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings-context";

const QUICK_LINKS = [
  { to: "/tin-tuc", label: "Tin tức" },
  { to: "/gioi-thieu", label: "Giới thiệu" },
  { to: "/van-ban", label: "Văn bản" },
  { to: "/danh-ba-cong-doan-vien", label: "Công đoàn viên" },
  { to: "/lien-he", label: "Liên hệ" },
  { to: "/cong-doan-vien", label: "Cổng đoàn viên" }
];

/** Footer — toàn bộ nội dung tĩnh (logo, slogan, địa chỉ, liên hệ, giờ hành chính, bản quyền) lấy từ
 * cấu hình chung (useSiteSettings, quản lý qua trang admin "Cấu hình chung") thay vì hard-code như
 * trước — admin tự sửa mà không cần đổi code. Facebook/Youtube chỉ hiện khi admin đã nhập URL thật
 * (trước đây là link "#" giả, bấm vào không đi đâu). */
export function Footer() {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();
  const hasSocialLinks = Boolean(settings.facebookUrl || settings.youtubeUrl);
  const workingHours = [settings.workingHoursWeekday, settings.workingHoursLunch, settings.workingHoursWeekend].filter(
    Boolean
  );

  return (
    <footer className="mt-16 border-t bg-gradient-to-b from-muted/30 to-muted/60">
      {/* Dải nhấn mỏng trên cùng — tạo điểm phân cách rõ ràng với nội dung trang, đồng thời trông
       * "có chủ đích thiết kế" hơn là chỉ 1 đường viền border-t đơn thuần. */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="mb-4 flex items-center gap-3">
            <img
              src={settings.logoUrl}
              alt={settings.shortName}
              className="size-11 shrink-0 rounded-full bg-background object-contain p-1 shadow-sm ring-1 ring-border"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <span className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
              CĐ
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-bold text-primary">{settings.shortName}</span>
              {settings.slogan ? <span className="text-xs text-muted-foreground">{settings.slogan}</span> : null}
            </span>
          </Link>
          {settings.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{settings.description}</p>
          ) : null}
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">Liên kết nhanh</h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-primary hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">Thông tin liên hệ</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {settings.address ? (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{settings.address}</span>
              </li>
            ) : null}
            {settings.hotline || settings.officePhone ? (
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                <span>
                  {settings.hotline ? `Hotline: ${settings.hotline}` : null}
                  {settings.hotline && settings.officePhone ? " — " : null}
                  {settings.officePhone ? `VP: ${settings.officePhone}` : null}
                </span>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-primary hover:underline">
                  {settings.email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">Giờ hành chính</h3>
          {workingHours.length > 0 ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {workingHours.map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {hasSocialLinks ? (
            <div className="mt-5 flex items-center gap-2">
              {settings.facebookUrl ? (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Facebook ${settings.shortName}`}
                  className="flex size-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Facebook className="size-4" />
                </a>
              ) : null}
              {settings.youtubeUrl ? (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Youtube ${settings.shortName}`}
                  className="flex size-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Youtube className="size-4" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground">
          © {year} {settings.copyrightText ?? settings.siteName}
        </div>
      </div>
    </footer>
  );
}
