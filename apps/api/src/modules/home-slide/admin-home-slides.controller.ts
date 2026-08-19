import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { HomeSlideDto, JwtAccessPayload } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { HomeSlidesService } from "./home-slides.service";
import { CreateHomeSlideDto } from "./dto/create-home-slide.dto";
import { UpdateHomeSlideDto } from "./dto/update-home-slide.dto";

/** CRUD banner trang chủ cho trang quản trị — bảo vệ theo permission "homeslide:*". */
@ApiBearerAuth()
@ApiTags("admin-home-slides")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/home-slides")
export class AdminHomeSlidesController {
  constructor(private readonly homeSlidesService: HomeSlidesService) {}

  @RequirePermissions("homeslide:view")
  @Get()
  list(): Promise<HomeSlideDto[]> {
    return this.homeSlidesService.listForAdmin();
  }

  @RequirePermissions("homeslide:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<HomeSlideDto> {
    return this.homeSlidesService.findOne(id);
  }

  @RequirePermissions("homeslide:create")
  @Post()
  create(@Body() dto: CreateHomeSlideDto, @CurrentUser() actor: JwtAccessPayload): Promise<HomeSlideDto> {
    return this.homeSlidesService.create(dto, actor.sub);
  }

  @RequirePermissions("homeslide:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateHomeSlideDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<HomeSlideDto> {
    return this.homeSlidesService.update(id, dto, actor.sub);
  }

  @RequirePermissions("homeslide:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.homeSlidesService.remove(id, actor.sub);
  }
}
