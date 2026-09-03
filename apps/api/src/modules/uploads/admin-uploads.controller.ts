import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { UploadFileResponseDto, UploadImageResponseDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequireAnyPermissions, RequirePermissions } from "../../common/decorators/roles.decorator";
import { UploadsService, type UploadedDocumentFile, type UploadedImageFile } from "./uploads.service";

/**
 * Upload ảnh công khai (ảnh bìa / ảnh trong nội dung bài viết / ảnh công đoàn viên). File ghi vào
 * UPLOAD_IMAGES_DIR và trả URL root-relative "/upload/images/..." — IIS phục vụ tĩnh từ thư mục web
 * (không qua Nest). Cần 1 trong các quyền tạo/sửa nội dung có dùng ảnh (ADMIN có hết; UNION_CLERK có
 * unionmember/homeslide/document).
 */
@ApiBearerAuth()
@ApiTags("admin-uploads")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/uploads")
export class AdminUploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @RequireAnyPermissions("post:create", "unionmember:update", "homeslide:update", "document:update")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"]
    }
  })
  @UseInterceptors(FileInterceptor("file"))
  @Post("images")
  uploadImage(@UploadedFile() file: UploadedImageFile | undefined): UploadImageResponseDto {
    return this.uploadsService.saveImage(file);
  }

  @RequirePermissions("legaleducation:update")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"]
    }
  })
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 25 * 1024 * 1024 } }))
  @Post("files")
  uploadFile(@UploadedFile() file: UploadedDocumentFile | undefined): UploadFileResponseDto {
    return this.uploadsService.saveDocument(file);
  }
}
