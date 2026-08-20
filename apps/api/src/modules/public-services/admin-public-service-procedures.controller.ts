import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, PublicServiceProcedureDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PublicServiceProceduresService } from "./public-service-procedures.service";
import { CreatePublicServiceProcedureDto } from "./dto/create-public-service-procedure.dto";
import { UpdatePublicServiceProcedureDto } from "./dto/update-public-service-procedure.dto";

/** CRUD "Thủ tục dịch vụ công" (nhóm 1 + 2 của Dịch vụ công, Phase 4e) — bảo vệ theo permission
 * "publicserviceprocedure:*" (mặc định: ADMIN, UNION_CLERK). */
@ApiBearerAuth()
@ApiTags("admin-public-service-procedures")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/public-service-procedures")
export class AdminPublicServiceProceduresController {
  constructor(private readonly proceduresService: PublicServiceProceduresService) {}

  @RequirePermissions("publicserviceprocedure:view")
  @Get()
  list(): Promise<PublicServiceProcedureDto[]> {
    return this.proceduresService.listForAdmin();
  }

  @RequirePermissions("publicserviceprocedure:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<PublicServiceProcedureDto> {
    return this.proceduresService.findOne(id);
  }

  @RequirePermissions("publicserviceprocedure:create")
  @Post()
  create(
    @Body() dto: CreatePublicServiceProcedureDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<PublicServiceProcedureDto> {
    return this.proceduresService.create(dto, actor.sub);
  }

  @RequirePermissions("publicserviceprocedure:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePublicServiceProcedureDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<PublicServiceProcedureDto> {
    return this.proceduresService.update(id, dto, actor.sub);
  }

  @RequirePermissions("publicserviceprocedure:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.proceduresService.remove(id, actor.sub);
  }
}
