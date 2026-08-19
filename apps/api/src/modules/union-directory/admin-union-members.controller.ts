import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, PaginatedResult, UnionMemberListItemDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UnionMembersService } from "./union-members.service";
import { CreateUnionMemberDto } from "./dto/create-union-member.dto";
import { UpdateUnionMemberDto } from "./dto/update-union-member.dto";
import { QueryUnionMembersDto } from "./dto/query-union-members.dto";

/** CRUD "Công đoàn viên" cho trang quản trị — bảo vệ theo permission "unionmember:*". Khác endpoint
 * công khai, trả về TOÀN BỘ (kể cả isPublic=false) để admin có thể tự bật/tắt hiển thị. */
@ApiBearerAuth()
@ApiTags("admin-union-members")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/union-members")
export class AdminUnionMembersController {
  constructor(private readonly unionMembersService: UnionMembersService) {}

  @RequirePermissions("unionmember:view")
  @Get()
  list(@Query() query: QueryUnionMembersDto): Promise<PaginatedResult<UnionMemberListItemDto>> {
    return this.unionMembersService.listForAdmin(query);
  }

  @RequirePermissions("unionmember:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<UnionMemberListItemDto> {
    return this.unionMembersService.findOne(id);
  }

  @RequirePermissions("unionmember:create")
  @Post()
  create(@Body() dto: CreateUnionMemberDto, @CurrentUser() actor: JwtAccessPayload): Promise<UnionMemberListItemDto> {
    return this.unionMembersService.create(dto, actor.sub);
  }

  @RequirePermissions("unionmember:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUnionMemberDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UnionMemberListItemDto> {
    return this.unionMembersService.update(id, dto, actor.sub);
  }

  @RequirePermissions("unionmember:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.unionMembersService.remove(id, actor.sub);
  }
}
