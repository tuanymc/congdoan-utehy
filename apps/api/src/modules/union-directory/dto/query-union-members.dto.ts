import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

/** Dùng chung cho cả endpoint công khai (/union-members) và trang quản trị (/admin/union-members) —
 * search theo họ tên (khớp textbox txtSearch1 web cũ), lọc theo departmentId (khớp ddlSearchList). */
export class QueryUnionMembersDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;
}
