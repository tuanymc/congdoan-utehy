import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type {
  DepartmentMemberScopeDto,
  JwtAccessPayload,
  PaginatedResult,
  UnionMemberListItemDto
} from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { DepartmentMembersService } from "./department-members.service";
import { QueryUnionMembersDto } from "./dto/query-union-members.dto";
import { UpdateDepartmentMemberDto } from "./dto/update-department-member.dto";

/** Cổng /cong-doan-vien — chủ tịch công đoàn bộ phận xem/sửa đoàn viên thuộc bộ phận mình.
 * Không có POST (thêm) / DELETE (xoá). */
@ApiBearerAuth()
@ApiTags("me-department-members")
@UseGuards(JwtAuthGuard)
@Controller("me/department-members")
export class MeDepartmentMembersController {
  constructor(private readonly departmentMembers: DepartmentMembersService) {}

  @Get("scope")
  scope(@CurrentUser() user: JwtAccessPayload): Promise<DepartmentMemberScopeDto> {
    return this.departmentMembers.getScope(user);
  }

  @Get()
  list(
    @CurrentUser() user: JwtAccessPayload,
    @Query() query: QueryUnionMembersDto
  ): Promise<PaginatedResult<UnionMemberListItemDto>> {
    return this.departmentMembers.list(user, query);
  }

  @Get(":id")
  findOne(@CurrentUser() user: JwtAccessPayload, @Param("id") id: string): Promise<UnionMemberListItemDto> {
    return this.departmentMembers.findOne(user, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: JwtAccessPayload,
    @Param("id") id: string,
    @Body() dto: UpdateDepartmentMemberDto
  ): Promise<UnionMemberListItemDto> {
    return this.departmentMembers.update(user, id, dto);
  }
}
