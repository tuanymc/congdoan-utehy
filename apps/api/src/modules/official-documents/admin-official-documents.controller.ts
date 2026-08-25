import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "node:fs";
import type { Response } from "express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, OfficialDocumentDetailDto, OfficialDocumentListItemDto, PaginatedResult } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { OfficialDocumentsService, type UploadedAttachmentFile } from "./official-documents.service";
import { contentDispositionHeader } from "../../common/utils/attachment-path";
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
      "Content-Disposition": contentDispositionHeader(fileName, "attachment")
    });
    return new StreamableFile(createReadStream(physicalPath));
  }

  // Cho phép chọn 1 hoặc nhiều file cùng lúc (field "files" lặp lại nhiều lần trong multipart/form-data
  // — FormData.append("files", file) gọi nhiều lần phía client, xem OfficialDocumentForm.tsx). Dùng
  // permission "document:update" (không tạo riêng "document:upload") vì đính kèm thêm file cho 1 công
  // văn đã tồn tại về bản chất là 1 dạng cập nhật công văn đó. Multer mặc định dùng memory storage khi
  // không truyền option `storage` — file nằm trong RAM dạng buffer tới khi service tự ghi ra đĩa (xem
  // OfficialDocumentsService.addAttachments), tránh phải khai báo đường dẫn lưu ngay tại decorator.
  @RequirePermissions("document:update")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FilesInterceptor("files", 10))
  @Post(":id/attachments")
  uploadAttachments(
    @Param("id") id: string,
    @UploadedFiles() files: UploadedAttachmentFile[] | undefined,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<OfficialDocumentDetailDto> {
    return this.officialDocumentsService.addAttachments(id, files ?? [], actor.sub);
  }

  @RequirePermissions("document:update")
  @Delete(":id/attachments/:attachmentId")
  removeAttachment(
    @Param("id") id: string,
    @Param("attachmentId") attachmentId: string,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<void> {
    return this.officialDocumentsService.removeAttachment(id, attachmentId, actor.sub);
  }
}
