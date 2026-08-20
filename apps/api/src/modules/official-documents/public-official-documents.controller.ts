import { Controller, Get, Param, Query, Res, StreamableFile } from "@nestjs/common";
import { createReadStream } from "node:fs";
import type { Response } from "express";
import { ApiTags } from "@nestjs/swagger";
import type { PaginatedResult, PublicOfficialDocumentDetailDto, PublicOfficialDocumentListItemDto } from "@congdoan/types";
import { resolveViewableMimeType } from "../../common/utils/mime-type";
import { OfficialDocumentsService } from "./official-documents.service";
import { QueryPublicOfficialDocumentsDto } from "./dto/query-public-official-documents.dto";

/**
 * Endpoint công khai — trang "Văn bản" (thay phần công khai của hệ công văn web cũ). KHÔNG có
 * JwtAuthGuard/PermissionsGuard như bản admin — CHỈ trả công văn isPublic=true (khớp ShowWeb=1 web
 * cũ), toàn bộ field nội bộ (status xử lý, người tạo, người xử lý...) đã bị lược bỏ ở tầng DTO/service
 * (xem PublicOfficialDocumentListItemDto/DetailDto trong packages/types/src/official-document.ts).
 */
@ApiTags("public-official-documents")
@Controller("official-documents")
export class PublicOfficialDocumentsController {
  constructor(private readonly officialDocumentsService: OfficialDocumentsService) {}

  @Get()
  list(@Query() query: QueryPublicOfficialDocumentsDto): Promise<PaginatedResult<PublicOfficialDocumentListItemDto>> {
    return this.officialDocumentsService.listPublic(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<PublicOfficialDocumentDetailDto> {
    return this.officialDocumentsService.findOnePublic(id);
  }

  @Get(":id/attachments/:attachmentId/download")
  async downloadAttachment(
    @Param("id") id: string,
    @Param("attachmentId") attachmentId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const { fileName, physicalPath } = await this.officialDocumentsService.getPublicAttachmentForDownload(id, attachmentId);
    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`
    });
    return new StreamableFile(createReadStream(physicalPath));
  }

  // "Xem" (khác "download" ở trên): Content-Disposition inline + Content-Type đúng định dạng (PDF/ảnh)
  // để trình duyệt render thẳng file ngay trên trang (DocumentDetailPage.tsx nhúng bằng <iframe>/<img>)
  // thay vì luôn ép tải xuống — người dùng vẫn có nút "Tải về" riêng dùng route download ở trên. Đuôi
  // file không render được (doc/docx/xls...) trả về "application/octet-stream", trình duyệt sẽ tự tải
  // xuống như bình thường dù response gợi ý inline (xem resolveViewableMimeType).
  @Get(":id/attachments/:attachmentId/view")
  async viewAttachment(
    @Param("id") id: string,
    @Param("attachmentId") attachmentId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const { fileName, physicalPath } = await this.officialDocumentsService.getPublicAttachmentForDownload(id, attachmentId);
    res.set({
      "Content-Type": resolveViewableMimeType(fileName),
      "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`
    });
    return new StreamableFile(createReadStream(physicalPath));
  }
}
