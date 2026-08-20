import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { AiToolResourceDto, JwtAccessPayload } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AiToolsService } from "./ai-tools.service";
import { CreateAiToolResourceDto } from "./dto/create-ai-tool-resource.dto";
import { UpdateAiToolResourceDto } from "./dto/update-ai-tool-resource.dto";

/** CRUD "Kho công cụ AI" — bảo vệ theo permission "aitoolresource:*" (mặc định: ADMIN, UNION_CLERK). */
@ApiBearerAuth()
@ApiTags("admin-ai-tools")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/ai-tools")
export class AdminAiToolsController {
  constructor(private readonly aiToolsService: AiToolsService) {}

  @RequirePermissions("aitoolresource:view")
  @Get()
  list(): Promise<AiToolResourceDto[]> {
    return this.aiToolsService.listForAdmin();
  }

  @RequirePermissions("aitoolresource:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<AiToolResourceDto> {
    return this.aiToolsService.findOne(id);
  }

  @RequirePermissions("aitoolresource:create")
  @Post()
  create(@Body() dto: CreateAiToolResourceDto, @CurrentUser() actor: JwtAccessPayload): Promise<AiToolResourceDto> {
    return this.aiToolsService.create(dto, actor.sub);
  }

  @RequirePermissions("aitoolresource:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateAiToolResourceDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<AiToolResourceDto> {
    return this.aiToolsService.update(id, dto, actor.sub);
  }

  @RequirePermissions("aitoolresource:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.aiToolsService.remove(id, actor.sub);
  }
}
