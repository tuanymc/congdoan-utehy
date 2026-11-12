import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import type { UpdateMyUnionMemberRequest } from "@congdoan/types";

/** Giữ PATCH /me/union-member tương thích — nội dung được chuyển thành yêu cầu chờ duyệt,
 * không ghi thẳng vào danh bạ. */
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
