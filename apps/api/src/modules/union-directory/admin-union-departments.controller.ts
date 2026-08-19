import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, UnionDepartmentDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UnionDepartmentsService } from "./union-departments.service";
import { CreateUnionDepartmentDto } from "./dto/create-union-department.dto";
import { UpdateUnionDepartmentDto } from "./dto/update-union-department.dto";

/** CRUD "Công đoàn bộ phận" cho trang quản trị — bảo vệ theo permission "uniondepartment:*". */
@ApiBearerAuth()
@ApiTags("admin-union-departments")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/union-departments")
export class AdminUnionDepartmentsController {
  constructor(private readonly unionDepartmentsService: UnionDepartmentsService) {}

  @RequirePermissions("uniondepartment:view")
  @Get()
  list(): Promise<UnionDepartmentDto[]> {
    return this.unionDepartmentsService.list();
  }

  @RequirePermissions("uniondepartment:create")
  @Post()
  create(@Body() dto: CreateUnionDepartmentDto, @CurrentUser() actor: JwtAccessPayload): Promise<UnionDepartmentDto> {
    return this.unionDepartmentsService.create(dto, actor.sub);
  }

  @RequirePermissions("uniondepartment:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUnionDepartmentDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UnionDepartmentDto> {
    return this.unionDepartmentsService.update(id, dto, actor.sub);
  }

  @RequirePermissions("uniondepartment:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.unionDepartmentsService.remove(id, actor.sub);
  }
}
