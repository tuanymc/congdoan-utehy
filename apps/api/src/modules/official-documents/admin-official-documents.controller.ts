import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, OfficialDocumentDetailDto, OfficialDocumentListItemDto, PaginatedResult } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { OfficialDocumentsService } from "./official-documents.service";
import { CreateOfficialDocumentDto } from "./dto/create-official-document.dto";
import { UpdateOfficialDocumentDto } from "./dto/update-official-document.dto";
import { QueryOfficialDocumentsDto } from "./dto/query-official-documents.dto";

/**
 * CRUD "Công văn đi/đến" — bảo vệ theo permission "document:*" (mặc định: ADMIN, UNION_CLERK).
 * KHÔNG có endpoint công khai — công văn là dữ liệu nội bộ, không hiển thị trên apps/web.
 */
@ApiBearerAuth()
@ApiTags("admin-official-documents")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/official-documents")
export class AdminOfficialDocumentsController {
  constructor(private readonly officialDocumentsService: OfficialDocumentsService) {}

  @RequirePermissions("document:view")
  @Get()
  list(@Query() query: QueryOfficialDocumentsDto): Promise<PaginatedResult<OfficialDocumentListItemDto>> {
    return this.officialDocumentsService.list(query);
  }

  @RequirePermissions("document:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<OfficialDocumentDetailDto> {
    return this.officialDocumentsService.findOne(id);
  }

  @RequirePermissions("document:create")
  @Post()
  create(@Body() dto: CreateOfficialDocumentDto, @CurrentUser() actor: JwtAccessPayload): Promise<OfficialDocumentDetailDto> {
    return this.officialDocumentsService.create(dto, actor.sub);
  }

  @RequirePermissions("document:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateOfficialDocumentDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<OfficialDocumentDetailDto> {
    return this.officialDocumentsService.update(id, dto, actor.sub);
  }

  @RequirePermissions("document:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.officialDocumentsService.remove(id, actor.sub);
  }
}
