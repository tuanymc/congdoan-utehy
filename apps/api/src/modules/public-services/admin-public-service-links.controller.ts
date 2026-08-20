import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, PublicServiceLinkDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PublicServiceLinksService } from "./public-service-links.service";
import { CreatePublicServiceLinkDto } from "./dto/create-public-service-link.dto";
import { UpdatePublicServiceLinkDto } from "./dto/update-public-service-link.dto";

/** CRUD "Kho biểu mẫu và đường dẫn chính thống" (nhóm 3 của Dịch vụ công, Phase 4e) — bảo vệ theo
 * permission "publicservicelink:*" (mặc định: ADMIN, UNION_CLERK). */
@ApiBearerAuth()
@ApiTags("admin-public-service-links")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/public-service-links")
export class AdminPublicServiceLinksController {
  constructor(private readonly linksService: PublicServiceLinksService) {}

  @RequirePermissions("publicservicelink:view")
  @Get()
  list(): Promise<PublicServiceLinkDto[]> {
    return this.linksService.listForAdmin();
  }

  @RequirePermissions("publicservicelink:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<PublicServiceLinkDto> {
    return this.linksService.findOne(id);
  }

  @RequirePermissions("publicservicelink:create")
  @Post()
  create(@Body() dto: CreatePublicServiceLinkDto, @CurrentUser() actor: JwtAccessPayload): Promise<PublicServiceLinkDto> {
    return this.linksService.create(dto, actor.sub);
  }

  @RequirePermissions("publicservicelink:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePublicServiceLinkDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<PublicServiceLinkDto> {
    return this.linksService.update(id, dto, actor.sub);
  }

  @RequirePermissions("publicservicelink:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.linksService.remove(id, actor.sub);
  }
}
