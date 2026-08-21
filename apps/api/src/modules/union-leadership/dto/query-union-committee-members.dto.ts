import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

/** Dùng chung cho cả endpoint công khai (/union-committee-members) và trang quản trị
 * (/admin/union-committee-members) — bắt buộc lọc theo termId (không hiển thị "tất cả nhiệm kỳ" trộn
 * lẫn), departmentId optional ("__school__" = chỉ lấy cấp trường, bỏ qua = lấy tất cả cấp trong nhiệm
 * kỳ đó, xem UnionCommitteeMembersService.list). */
export class QueryUnionCommitteeMembersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;
}
