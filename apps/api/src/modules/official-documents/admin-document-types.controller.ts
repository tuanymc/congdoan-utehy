import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { DocumentTypeDto, JwtAccessPayload } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { DocumentTypesService } from "./document-types.service";
import { CreateDocumentTypeDto } from "./dto/create-document-type.dto";
import { UpdateDocumentTypeDto } from "./dto/update-document-type.dto";

/** CRUD "Loại công văn" — bảo vệ theo permission "documenttype:*" (mặc định: ADMIN, UNION_CLERK). */
@ApiBearerAuth()
@ApiTags("admin-document-types")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/document-types")
export class AdminDocumentTypesController {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  @RequirePermissions("documenttype:view")
  @Get()
  list(): Promise<DocumentTypeDto[]> {
    return this.documentTypesService.list();
  }

  @RequirePermissions("documenttype:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<DocumentTypeDto> {
    return this.documentTypesService.findOne(id);
  }

  @RequirePermissions("documenttype:create")
  @Post()
  create(@Body() dto: CreateDocumentTypeDto, @CurrentUser() actor: JwtAccessPayload): Promise<DocumentTypeDto> {
    return this.documentTypesService.create(dto, actor.sub);
  }

  @RequirePermissions("documenttype:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateDocumentTypeDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<DocumentTypeDto> {
    return this.documentTypesService.update(id, dto, actor.sub);
  }

  @RequirePermissions("documenttype:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.documentTypesService.remove(id, actor.sub);
  }
}
