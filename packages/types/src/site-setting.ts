/**
 * Domain SiteSetting — cấu hình chung toàn site (logo, thông tin liên hệ, SEO mặc định). Chỉ có DUY
 * NHẤT 1 bản ghi (xem chú thích domain block SITESETTING trong prisma/schema.prisma).
 */

export interface SiteSettingDto {
  siteName: string;
  shortName: string;
  slogan: string | null;
  description: string | null;
  logoUrl: string;

  address: string | null;
  hotline: string | null;
  officePhone: string | null;
  email: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;

  workingHoursWeekday: string | null;
  workingHoursLunch: string | null;
  workingHoursWeekend: string | null;

  copyrightText: string | null;

  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
}

export interface UpdateSiteSettingRequest extends Partial<SiteSettingDto> {}
