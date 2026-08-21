import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, UnionCommitteeMemberDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UnionCommitteeMembersService } from "./union-committee-members.service";
import { CreateUnionCommitteeMemberDto } from "./dto/create-union-committee-member.dto";
import { UpdateUnionCommitteeMemberDto } from "./dto/update-union-committee-member.dto";
import { QueryUnionCommitteeMembersDto } from "./dto/query-union-committee-members.dto";

/** CRUD "Ban chấp hành theo nhiệm kỳ" cho trang quản trị — bảo vệ theo permission
 * "unioncommitteemember:*". */
@ApiBearerAuth()
@ApiTags("admin-union-committee-members")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/union-committee-members")
export class AdminUnionCommitteeMembersController {
  constructor(private readonly unionCommitteeMembersService: UnionCommitteeMembersService) {}

  @RequirePermissions("unioncommitteemember:view")
  @Get()
  list(@Query() query: QueryUnionCommitteeMembersDto): Promise<UnionCommitteeMemberDto[]> {
    return this.unionCommitteeMembersService.list(query);
  }

  @RequirePermissions("unioncommitteemember:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<UnionCommitteeMemberDto> {
    return this.unionCommitteeMembersService.findOne(id);
  }

  @RequirePermissions("unioncommitteemember:create")
  @Post()
  create(
    @Body() dto: CreateUnionCommitteeMemberDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UnionCommitteeMemberDto> {
    return this.unionCommitteeMembersService.create(dto, actor.sub);
  }

  @RequirePermissions("unioncommitteemember:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUnionCommitteeMemberDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UnionCommitteeMemberDto> {
    return this.unionCommitteeMembersService.update(id, dto, actor.sub);
  }

  @RequirePermissions("unioncommitteemember:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.unionCommitteeMembersService.remove(id, actor.sub);
  }
}
