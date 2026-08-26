import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from "class-validator";
import { HOME_BANNER_PLACEMENTS } from "@congdoan/types";
import type { CreateHomeSlideRequest, HomeBannerPlacement } from "@congdoan/types";

export class CreateHomeSlideDto implements CreateHomeSlideRequest {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  imageUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: HOME_BANNER_PLACEMENTS })
  @IsOptional()
  @IsIn(HOME_BANNER_PLACEMENTS)
  placement?: HomeBannerPlacement;
}
