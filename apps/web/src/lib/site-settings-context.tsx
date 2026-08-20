/**
 * Site settings context — cấu hình chung toàn site (logo, thông tin liên hệ, SEO mặc định), lấy 1
 * lần từ GET /site-settings công khai khi app khởi động, dùng chung cho Header/Footer/thẻ <title>.
 *
 * DEFAULT_SETTINGS giữ đúng nội dung từng hard-code sẵn ở Header.tsx/Footer.tsx trước khi có trang
 * "Cấu hình chung" trong admin — dùng làm giá trị hiển thị tạm trong lúc đang tải, và làm phương án
 * dự phòng nếu API lỗi/chưa chạy seed (site không được vỡ giao diện chỉ vì thiếu 1 API phụ).
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SiteSettingDto } from "@congdoan/types";
import { apiFetch } from "./api-client";

export const DEFAULT_SETTINGS: SiteSettingDto = {
  siteName: "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên",
  shortName: "Công đoàn UTEHY",
  slogan: "Đoàn kết – Trách nhiệm – Vì quyền lợi đoàn viên",
  description:
    "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên — tổ chức đại diện, bảo vệ quyền và lợi ích hợp pháp, chính đáng của cán bộ, giảng viên, người lao động nhà trường.",
  logoUrl: "/logo.png",
  address: "Xã Dân Tiến, Huyện Khoái Châu, Tỉnh Hưng Yên",
  hotline: "0962.490.411",
  officePhone: "03123.713.108",
  email: "congdoanutehy@gmail.com",
  facebookUrl: null,
  youtubeUrl: null,
  workingHoursWeekday: "Thứ Hai – Thứ Sáu: 7h30 – 17h00",
  workingHoursLunch: "Nghỉ trưa: 11h30 – 13h30",
  workingHoursWeekend: "Thứ Bảy, Chủ nhật: Nghỉ",
  copyrightText: "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên. Bảo lưu mọi quyền.",
  seoTitle: "Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên",
  seoDescription:
    "Cổng thông tin điện tử Công đoàn Trường Đại học Sư phạm Kỹ thuật Hưng Yên — tin tức, hoạt động và tiện ích số dành cho đoàn viên.",
  seoKeywords: "công đoàn, UTEHY, công đoàn UTEHY, đại học sư phạm kỹ thuật hưng yên",
  ogImageUrl: null
};

interface SiteSettingsContextValue {
  settings: SiteSettingDto;
  /** true trong lúc đang chờ API lần đầu — settings vẫn có giá trị hợp lệ (DEFAULT_SETTINGS) trong
   * lúc này nên UI không cần chờ, chỉ dùng cờ này nếu cần biết dữ liệu đã "thật" hay chưa. */
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  isLoading: true
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingDto>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch<SiteSettingDto>("/site-settings")
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        // Lỗi tải cấu hình không nên chặn cả trang — giữ nguyên DEFAULT_SETTINGS (giống hành vi cũ
        // khi nội dung này còn hard-code trong Header.tsx/Footer.tsx).
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading }}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  return useContext(SiteSettingsContext);
}
