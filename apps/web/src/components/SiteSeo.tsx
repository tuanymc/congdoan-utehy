/**
 * Áp dụng thẻ <title>/<meta name="description">/<meta name="keywords">/<meta property="og:image">
 * mặc định toàn site từ cấu hình admin (SiteSetting.seoTitle/seoDescription/seoKeywords/ogImageUrl) —
 * KHÔNG dùng thư viện react-helmet (thêm dependency chỉ cho 1 nhu cầu đơn giản: ghi đè giá trị tĩnh
 * đã có sẵn trong index.html bằng giá trị lấy từ CSDL). Chưa hỗ trợ SEO riêng theo từng trang (vd
 * mô tả riêng cho từng bài viết) — nằm ngoài phạm vi yêu cầu hiện tại, chỉ thay thế phần "cấu hình
 * SEO" tĩnh trong index.html bằng nội dung quản lý được qua admin.
 */
import { useEffect } from "react";
import { useSiteSettings } from "@/lib/site-settings-context";

function setMetaTag(selector: string, attribute: "name" | "property", value: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export function SiteSeo() {
  const { settings, isLoading } = useSiteSettings();

  useEffect(() => {
    // Chờ tải xong mới ghi đè — tránh nháy 1 nhịp title/meta mặc định rồi đổi lại đúng giá trị mặc
    // định đó (DEFAULT_SETTINGS khớp y hệt nội dung tĩnh trong index.html) khi API lỗi/chậm.
    if (isLoading) return;

    if (settings.seoTitle) document.title = settings.seoTitle;
    if (settings.seoDescription) {
      setMetaTag('meta[name="description"]', "name", "description", settings.seoDescription);
    }
    if (settings.seoKeywords) {
      setMetaTag('meta[name="keywords"]', "name", "keywords", settings.seoKeywords);
    }
    if (settings.ogImageUrl) {
      setMetaTag('meta[property="og:image"]', "property", "og:image", settings.ogImageUrl);
    }
  }, [settings, isLoading]);

  return null;
}
