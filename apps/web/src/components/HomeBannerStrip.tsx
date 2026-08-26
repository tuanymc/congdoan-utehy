import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { HomeSlideDto } from "@congdoan/types";
import { cn } from "@/components/ui/utils";

function BannerFrame({ banner, children }: { banner: HomeSlideDto; children: ReactNode }) {
  const href = banner.linkUrl?.trim();
  if (!href) {
    return <div className="block">{children}</div>;
  }
  if (href.startsWith("/")) {
    return (
      <Link to={href} className="block transition-opacity hover:opacity-90">
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className="block transition-opacity hover:opacity-90" target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

/**
 * Dải banner tĩnh trên trang chủ — vị trí AFTER_SLIDE (ngay dưới slider) hoặc BEFORE_FOOTER (ngay
 * trên footer), khớp tblSlideLink web cũ (ảnh + link, không trượt). 1 ảnh thì full-width; nhiều ảnh
 * thì xếp lưới.
 */
export function HomeBannerStrip({
  banners,
  className
}: {
  banners: HomeSlideDto[];
  className?: string;
}) {
  if (banners.length === 0) return null;

  const gridClass =
    banners.length === 1
      ? ""
      : banners.length === 2
        ? "grid gap-3 sm:grid-cols-2"
        : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className={cn("w-full", className)}>
      <div className={cn("mx-auto max-w-6xl px-4", gridClass)}>
        {banners.map((banner) => (
          <BannerFrame key={banner.id} banner={banner}>
            <img
              src={banner.imageUrl}
              alt={banner.name}
              className="h-auto w-full rounded-lg object-contain"
              loading="lazy"
            />
          </BannerFrame>
        ))}
      </div>
    </section>
  );
}
