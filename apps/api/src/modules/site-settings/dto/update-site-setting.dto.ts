import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import type { UpdateSiteSettingRequest } from "@congdoan/types";

/** Toàn bộ field đều optional (PATCH từng phần) — không có DTO "create" riêng vì SiteSetting chỉ có
 * duy nhất 1 dòng, luôn đã tồn tại sẵn (getOrCreate() tự tạo dòng mặc định khi seed/lần đọc đầu tiên,
 * xem site-settings.service.ts). Không validate độ dài/format cụ thể (số điện thoại, email...) — đây
 * là nội dung admin tự nhập hiển thị tĩnh, không phải dữ liệu nghiệp vụ cần chuẩn hoá nghiêm ngặt. */
export class UpdateSiteSettingDto implements UpdateSiteSettingRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siteName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  slogan?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  hotline?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  officePhone?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  facebookUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  youtubeUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  workingHoursWeekday?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  workingHoursLunch?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  workingHoursWeekend?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  copyrightText?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  seoDescription?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  seoKeywords?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  ogImageUrl?: string | null;
}
