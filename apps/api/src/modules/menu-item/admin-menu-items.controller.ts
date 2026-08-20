import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, MenuItemDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MenuItemsService } from "./menu-items.service";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";

/** CRUD menu điều hướng cho trang quản trị — bảo vệ theo permission "menuitem:*" (xem prisma/seed.ts:
 * ADMIN có đủ view/create/update/delete, UNION_CLERK chỉ view/create/update — xoá mục menu ảnh hưởng
 * điều hướng toàn site nên chỉ ADMIN được xoá). */
@ApiBearerAuth()
@ApiTags("admin-menu-items")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/menu-items")
export class AdminMenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @RequirePermissions("menuitem:view")
  @Get()
  list(): Promise<MenuItemDto[]> {
    return this.menuItemsService.listForAdmin();
  }

  @RequirePermissions("menuitem:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<MenuItemDto> {
    return this.menuItemsService.findOne(id);
  }

  @RequirePermissions("menuitem:create")
  @Post()
  create(@Body() dto: CreateMenuItemDto, @CurrentUser() actor: JwtAccessPayload): Promise<MenuItemDto> {
    return this.menuItemsService.create(dto, actor.sub);
  }

  @RequirePermissions("menuitem:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<MenuItemDto> {
    return this.menuItemsService.update(id, dto, actor.sub);
  }

  @RequirePermissions("menuitem:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.menuItemsService.remove(id, actor.sub);
  }
}
