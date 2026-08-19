import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PaginatedResult, UnionMemberListItemDto } from "@congdoan/types";
import { UnionMembersService } from "./union-members.service";
import { QueryUnionMembersDto } from "./dto/query-union-members.dto";

/** Endpoint công khai — trang "Công đoàn viên" (thay modules/GioiThieuCongDoanVien.aspx web cũ). Chỉ
 * trả công đoàn viên isPublic=true, search theo họ tên + lọc theo công đoàn bộ phận. */
@ApiTags("union-members")
@Controller("union-members")
export class UnionMembersController {
  constructor(private readonly unionMembersService: UnionMembersService) {}

  @Get()
  list(@Query() query: QueryUnionMembersDto): Promise<PaginatedResult<UnionMemberListItemDto>> {
    return this.unionMembersService.listPublic(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<UnionMemberListItemDto> {
    return this.unionMembersService.findOne(id);
  }
}
