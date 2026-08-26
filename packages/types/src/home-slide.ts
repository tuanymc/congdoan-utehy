/**
 * Domain HomeSlide — banner/slide ảnh trang chủ (thay tblSlide web cũ). Xem chú thích domain block
 * HOMESLIDE trong prisma/schema.prisma.
 */

/** Vị trí banner trên trang chủ — khớp HomeSlide.placement (String, không phải Prisma enum). */
export const HOME_BANNER_PLACEMENTS = ["SLIDER", "AFTER_SLIDE", "BEFORE_FOOTER"] as const;
export type HomeBannerPlacement = (typeof HOME_BANNER_PLACEMENTS)[number];

export const HOME_BANNER_PLACEMENT_LABELS: Record<HomeBannerPlacement, string> = {
  SLIDER: "Slider đầu trang",
  AFTER_SLIDE: "Dưới slide",
  BEFORE_FOOTER: "Trên footer"
};

export interface HomeSlideDto {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  placement: HomeBannerPlacement;
}

export interface CreateHomeSlideRequest {
  name: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  placement?: HomeBannerPlacement;
}

export interface UpdateHomeSlideRequest extends Partial<CreateHomeSlideRequest> {}
