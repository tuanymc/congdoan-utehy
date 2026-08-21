import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, UnionTermDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UnionTermsService } from "./union-terms.service";
import { CreateUnionTermDto } from "./dto/create-union-term.dto";
import { UpdateUnionTermDto } from "./dto/update-union-term.dto";

/** CRUD "Nhiệm kỳ Ban chấp hành" cho trang quản trị — bảo vệ theo permission "unionterm:*". */
@ApiBearerAuth()
@ApiTags("admin-union-terms")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/union-terms")
export class AdminUnionTermsController {
  constructor(private readonly unionTermsService: UnionTermsService) {}

  @RequirePermissions("unionterm:view")
  @Get()
  list(): Promise<UnionTermDto[]> {
    return this.unionTermsService.list();
  }

  @RequirePermissions("unionterm:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<UnionTermDto> {
    return this.unionTermsService.findOne(id);
  }

  @RequirePermissions("unionterm:create")
  @Post()
  create(@Body() dto: CreateUnionTermDto, @CurrentUser() actor: JwtAccessPayload): Promise<UnionTermDto> {
    return this.unionTermsService.create(dto, actor.sub);
  }

  @RequirePermissions("unionterm:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUnionTermDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UnionTermDto> {
    return this.unionTermsService.update(id, dto, actor.sub);
  }

  @RequirePermissions("unionterm:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.unionTermsService.remove(id, actor.sub);
  }
}
