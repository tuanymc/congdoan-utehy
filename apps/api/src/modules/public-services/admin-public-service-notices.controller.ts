import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, PublicServiceNoticeDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PublicServiceNoticesService } from "./public-service-notices.service";
import { CreatePublicServiceNoticeDto } from "./dto/create-public-service-notice.dto";
import { UpdatePublicServiceNoticeDto } from "./dto/update-public-service-notice.dto";

/** CRUD "Cảnh báo và nhắc việc" (nhóm 5 của Dịch vụ công, Phase 4e) — bảo vệ theo permission
 * "publicservicenotice:*" (mặc định: ADMIN, UNION_CLERK). */
@ApiBearerAuth()
@ApiTags("admin-public-service-notices")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/public-service-notices")
export class AdminPublicServiceNoticesController {
  constructor(private readonly noticesService: PublicServiceNoticesService) {}

  @RequirePermissions("publicservicenotice:view")
  @Get()
  list(): Promise<PublicServiceNoticeDto[]> {
    return this.noticesService.listForAdmin();
  }

  @RequirePermissions("publicservicenotice:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<PublicServiceNoticeDto> {
    return this.noticesService.findOne(id);
  }

  @RequirePermissions("publicservicenotice:create")
  @Post()
  create(@Body() dto: CreatePublicServiceNoticeDto, @CurrentUser() actor: JwtAccessPayload): Promise<PublicServiceNoticeDto> {
    return this.noticesService.create(dto, actor.sub);
  }

  @RequirePermissions("publicservicenotice:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePublicServiceNoticeDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<PublicServiceNoticeDto> {
    return this.noticesService.update(id, dto, actor.sub);
  }

  @RequirePermissions("publicservicenotice:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.noticesService.remove(id, actor.sub);
  }
}
