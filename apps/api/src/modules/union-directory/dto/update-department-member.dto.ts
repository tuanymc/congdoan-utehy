import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches, ValidateIf } from "class-validator";
import type { UpdateDepartmentMemberRequest } from "@congdoan/types";

/** Chủ tịch công đoàn bộ phận chỉ được sửa field danh bạ — không đổi bộ phận, không thêm, không xoá. */
export class UpdateDepartmentMemberDto implements UpdateDepartmentMemberRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, value) => typeof value === "string" && value.trim() !== "")
  @IsString()
  @Matches(/^(https?:\/\/|\/)/i, {
    message: "Ảnh phải là URL (https://...) hoặc đường dẫn bắt đầu bằng / (vd /upload/images/...)"
  })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}
