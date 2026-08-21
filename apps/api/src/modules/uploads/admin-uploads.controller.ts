import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { UploadImageResponseDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { UploadsService, type UploadedImageFile } from "./uploads.service";

/**
 * Upload ảnh công khai (ảnh bìa / ảnh trong nội dung bài viết). File ghi vào UPLOAD_IMAGES_DIR và
 * trả URL root-relative "/upload/images/..." — IIS phục vụ tĩnh từ thư mục web (không qua Nest).
 * Dùng permission "post:create" (ADMIN đã có; thao tác tạo/sửa bài đều gắn quyền này trên JWT admin).
 */
@ApiBearerAuth()
@ApiTags("admin-uploads")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/uploads")
export class AdminUploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @RequirePermissions("post:create")
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
}
