import { BadRequestException, Injectable } from "@nestjs/common";
import { mkdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { UploadImageResponseDto } from "@congdoan/types";

/** Tối thiểu những field cần đọc từ file multer — cùng khuôn UploadedAttachmentFile (không cần @types/multer). */
export interface UploadedImageFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp"
};

/** Thư mục con dưới UPLOAD_IMAGES_DIR — tách ảnh upload mới khỏi cây ảnh nhập từ web cũ. */
const ADMIN_UPLOADS_SUBDIR = "admin-uploads";

function sanitizeFileNameForDisk(name: string): string {
  const cleaned = name.replace(/[\\/]/g, "_").replace(/[^\w.-]+/g, "_");
  return cleaned.slice(-120) || "image";
}

/**
 * Upload ảnh công khai cho bài viết / ảnh bìa — ghi vào thư mục IIS phục vụ tĩnh tại
 * "/upload/images/..." (xem deploy guide robocopy upload/images vào web/).
 */
@Injectable()
export class UploadsService {
  /// Trên production PHẢI đặt UPLOAD_IMAGES_DIR trỏ đúng "C:\inetpub\congdoan2026\web\upload\images"
  /// (cùng physical path IIS phục vụ /upload/images). Dev mặc định "./upload/images" cạnh cwd API.
  private readonly uploadImagesDir = process.env.UPLOAD_IMAGES_DIR ?? join(process.cwd(), "upload", "images");

  saveImage(file: UploadedImageFile | undefined): UploadImageResponseDto {
    if (!file) {
      throw new BadRequestException("Chưa chọn ảnh để tải lên.");
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException("Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP.");
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException(`Ảnh vượt quá giới hạn ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`);
    }

    const extFromMime = MIME_TO_EXT[file.mimetype] ?? ".jpg";
    const originalExt = extname(file.originalname).toLowerCase();
    const ext = originalExt && [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(originalExt) ? originalExt : extFromMime;
    const baseName = sanitizeFileNameForDisk(file.originalname.replace(/\.[^.]+$/, ""));
    const diskName = `${randomUUID()}-${baseName}${ext === ".jpeg" ? ".jpg" : ext}`;

    const targetDir = join(this.uploadImagesDir, ADMIN_UPLOADS_SUBDIR);
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(join(targetDir, diskName), file.buffer);

    return {
      url: `/upload/images/${ADMIN_UPLOADS_SUBDIR}/${diskName}`,
      fileName: file.originalname
    };
  }
}
