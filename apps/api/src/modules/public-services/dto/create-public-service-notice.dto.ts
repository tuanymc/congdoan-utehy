import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";
import { PUBLIC_SERVICE_NOTICE_CATEGORIES } from "@congdoan/types";
import type { CreatePublicServiceNoticeRequest, PublicServiceNoticeCategory } from "@congdoan/types";

export class CreatePublicServiceNoticeDto implements CreatePublicServiceNoticeRequest {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional({ enum: PUBLIC_SERVICE_NOTICE_CATEGORIES })
  @IsOptional()
  @IsIn(PUBLIC_SERVICE_NOTICE_CATEGORIES)
  category?: PublicServiceNoticeCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
