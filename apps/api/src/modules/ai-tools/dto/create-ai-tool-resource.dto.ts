import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from "class-validator";
import type { CreateAiToolResourceRequest } from "@congdoan/types";

export class CreateAiToolResourceDto implements CreateAiToolResourceRequest {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  // Không dùng { require_tld: false } — cho phép cả link nội bộ dạng http://localhost lúc phát triển,
  // nhưng vẫn chặn được chuỗi rác không phải URL hợp lệ.
  @ApiProperty()
  @IsUrl({}, { message: "url phải là 1 đường dẫn hợp lệ (vd https://chat.openai.com)" })
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
