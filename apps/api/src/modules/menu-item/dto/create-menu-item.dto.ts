import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID } from "class-validator";
import type { CreateMenuItemRequest } from "@congdoan/types";

export class CreateMenuItemDto implements CreateMenuItemRequest {
  @ApiProperty()
  @IsString()
  label!: string;

  @ApiProperty({ description: 'Đường dẫn khi bấm vào mục, vd "/gioi-thieu" hoặc "/tin-tuc?category=van-hoa-doc".' })
  @IsString()
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Chỉ áp dụng cho mục cấp 1 (không có parentId) — xem menu.ts.' })
  @IsOptional()
  @IsBoolean()
  autoCategoryChildren?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    description: "Id mục cấp 1 làm cha — bỏ trống/null nếu đây là mục cấp 1."
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
