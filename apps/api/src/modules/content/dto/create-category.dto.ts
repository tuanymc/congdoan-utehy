import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";
import type { CreateCategoryRequest } from "@congdoan/types";

export class CreateCategoryDto implements CreateCategoryRequest {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Chuyên mục thuộc nhóm "Giới thiệu" ở web cũ — gom vào trang Giới thiệu.' })
  @IsOptional()
  @IsBoolean()
  isAboutSection?: boolean;

  @ApiPropertyOptional({
    description: 'false = ẩn mục menu tự động trỏ tới chuyên mục này khỏi dropdown "Tin hoạt động".'
  })
  @IsOptional()
  @IsBoolean()
  showInMenu?: boolean;
}
