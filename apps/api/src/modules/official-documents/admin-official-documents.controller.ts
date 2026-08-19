import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, StreamableFile, UseGuards } from "@nestjs/common";
import { createReadStream } from "node:fs";
import type { Response } from "express";
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

  // Chỉ cần permission "document:view" — tải file đính kèm là một dạng xem nội dung công văn, không
  // phải thao tác chỉnh sửa. File được stream trực tiếp từ đĩa (xem getAttachmentForDownload), không
  // qua URL tĩnh công khai nào — bắt buộc phải có JWT + permission hợp lệ mới tải được.
  @RequirePermissions("document:view")
  @Get(":id/attachments/:attachmentId/download")
  async downloadAttachment(
    @Param("id") id: string,
    @Param("attachmentId") attachmentId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const { fileName, physicalPath } = await this.officialDocumentsService.getAttachmentForDownload(id, attachmentId);
    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`
    });
    return new StreamableFile(createReadStream(physicalPath));
  }
}
