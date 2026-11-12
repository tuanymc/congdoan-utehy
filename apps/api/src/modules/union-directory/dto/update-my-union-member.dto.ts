import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import type { UpdateMyUnionMemberRequest } from "@congdoan/types";

/** Payload công đoàn viên tự cập nhật thông tin cá nhân ở "/cong-doan-vien" — CHỈ họ tên/SĐT/email
 * (áp ngay). Ảnh/chức vụ/trình độ đi qua yêu cầu chờ duyệt. Không dùng @IsEmail() ép buộc, cùng lý
 * do đã ghi ở CreateUnionMemberDto.email (dữ liệu tự do, không muốn chặn nhầm). */
export class UpdateMyUnionMemberDto implements UpdateMyUnionMemberRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}
