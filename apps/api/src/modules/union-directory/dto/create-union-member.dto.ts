import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";
import type { CreateUnionMemberRequest } from "@congdoan/types";

export class CreateUnionMemberDto implements CreateUnionMemberRequest {
  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  degreeLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  positionTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  // Không dùng @IsEmail() bắt buộc đúng định dạng — dữ liệu ETL từ web cũ (cột EMAIL kiểu ntext tự
  // do) có thể không đúng chuẩn email 100%, ép validate sẽ chặn nhầm khi admin sửa các field khác của
  // đúng bản ghi đó. Vẫn dùng IsEmail() nhưng optional + cho phép rỗng qua IsOptional.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;
}
