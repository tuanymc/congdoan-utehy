import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, PaginatedResult, RoleDto, UserDetailDto, UserListItemDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

/** Toàn bộ endpoint quản lý người dùng chỉ dành cho ADMIN (mục 6 bản thiết kế: RBAC theo module/thao tác). */
@ApiBearerAuth()
@ApiTags("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query() query: PaginationQueryDto): Promise<PaginatedResult<UserListItemDto>> {
    return this.usersService.list(query);
  }

  @Get("roles")
  listRoles(): Promise<RoleDto[]> {
    return this.usersService.listRoles();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<UserDetailDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser() actor: JwtAccessPayload): Promise<UserDetailDto> {
    return this.usersService.create(dto, actor.sub);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UserDetailDto> {
    return this.usersService.update(id, dto, actor.sub);
  }
}
