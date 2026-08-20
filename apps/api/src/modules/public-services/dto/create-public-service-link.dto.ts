import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from "class-validator";
import type { CreatePublicServiceLinkRequest } from "@congdoan/types";

export class CreatePublicServiceLinkDto implements CreatePublicServiceLinkRequest {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsUrl({}, { message: "Đường dẫn không hợp lệ, phải bắt đầu bằng http:// hoặc https://" })
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Nhãn nhóm tự do, vd "Cổng Dịch vụ công Quốc gia", "BHXH Việt Nam".' })
  @IsOptional()
  @IsString()
  group?: string;

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
