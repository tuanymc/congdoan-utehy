import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, PaginatedResult, UnionMemberListItemDto } from "@congdoan/types";
import { OptionalJwtAuthGuard } from "../../common/guards/optional-jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UnionMembersService } from "./union-members.service";
import { QueryUnionMembersDto } from "./dto/query-union-members.dto";

/** Endpoint công khai — trang "Công đoàn viên" (thay modules/GioiThieuCongDoanVien.aspx web cũ). Chỉ
 * trả công đoàn viên isPublic=true, search theo họ tên + lọc theo công đoàn bộ phận. SĐT/email chỉ
 * trả khi request có JWT hợp lệ. */
@ApiTags("union-members")
@UseGuards(OptionalJwtAuthGuard)
@Controller("union-members")
export class UnionMembersController {
  constructor(private readonly unionMembersService: UnionMembersService) {}

  @Get()
  list(
    @Query() query: QueryUnionMembersDto,
    @CurrentUser() user: JwtAccessPayload | null
  ): Promise<PaginatedResult<UnionMemberListItemDto>> {
    return this.unionMembersService.listPublic(query, Boolean(user));
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: JwtAccessPayload | null
  ): Promise<UnionMemberListItemDto> {
    return this.unionMembersService.findOne(id, Boolean(user));
  }
}
