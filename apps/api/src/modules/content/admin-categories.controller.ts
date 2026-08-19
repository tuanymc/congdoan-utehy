import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { CategoryDto, JwtAccessPayload } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

/** CRUD chuyên mục cho trang quản trị — bảo vệ theo permission "category:*" (mục 6 bản thiết kế). */
@ApiBearerAuth()
@ApiTags("admin-categories")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/categories")
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @RequirePermissions("category:create")
  @Post()
  create(@Body() dto: CreateCategoryDto, @CurrentUser() actor: JwtAccessPayload): Promise<CategoryDto> {
    return this.categoriesService.create(dto, actor.sub);
  }

  @RequirePermissions("category:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<CategoryDto> {
    return this.categoriesService.update(id, dto, actor.sub);
  }

  @RequirePermissions("category:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.categoriesService.remove(id, actor.sub);
  }
}
