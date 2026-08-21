import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import type { UpdateMyUnionMemberRequest } from "@congdoan/types";

/** Payload công đoàn viên tự cập nhật thông tin cá nhân ở "/cong-doan-vien" — CHỈ 4 field an toàn,
 * xem UpdateMyUnionMemberRequest. Không dùng @IsEmail() ép buộc, cùng lý do đã ghi ở
 * CreateUnionMemberDto.email (dữ liệu tự do, không muốn chặn nhầm). */
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
