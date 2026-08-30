import { BadRequestException, Injectable } from "@nestjs/common";
import { mkdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { UploadFileResponseDto, UploadImageResponseDto } from "@congdoan/types";

/** Tối thiểu những field cần đọc từ file multer — cùng khuôn UploadedAttachmentFile (không cần @types/multer). */
export interface UploadedImageFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export type UploadedDocumentFile = UploadedImageFile;

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp"
};

const DOCUMENT_MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx"
};

const ALLOWED_DOCUMENT_EXTS = new Set([".pdf", ".doc", ".docx"]);

/** Thư mục con dưới UPLOAD_IMAGES_DIR — tách ảnh upload mới khỏi cây ảnh nhập từ web cũ. */
const ADMIN_UPLOADS_SUBDIR = "admin-uploads";
const LEGAL_FILES_SUBDIR = "legal-education";

function sanitizeFileNameForDisk(name: string): string {
  const cleaned = name.replace(/[\\/]/g, "_").replace(/[^\w.-]+/g, "_");
  return cleaned.slice(-120) || "file";
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
  /// File PDF/Word phổ biến pháp luật — cạnh upload/images, IIS phục vụ /upload/legal-education/...
  private readonly uploadLegalFilesDir =
    process.env.UPLOAD_LEGAL_FILES_DIR ?? join(this.uploadImagesDir, "..", LEGAL_FILES_SUBDIR);

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

  saveDocument(file: UploadedDocumentFile | undefined): UploadFileResponseDto {
    if (!file) {
      throw new BadRequestException("Chưa chọn file để tải lên.");
    }
    const originalExt = extname(file.originalname).toLowerCase();
    const mimeOk = ALLOWED_DOCUMENT_MIME_TYPES.has(file.mimetype);
    const extOk = ALLOWED_DOCUMENT_EXTS.has(originalExt);
    if (!mimeOk && !extOk) {
      throw new BadRequestException("Chỉ chấp nhận file PDF, DOC hoặc DOCX.");
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      throw new BadRequestException(`File vượt quá giới hạn ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB.`);
    }

    const ext = extOk ? originalExt : (DOCUMENT_MIME_TO_EXT[file.mimetype] ?? ".pdf");
    const baseName = sanitizeFileNameForDisk(file.originalname.replace(/\.[^.]+$/, ""));
    const diskName = `${randomUUID()}-${baseName}${ext}`;

    mkdirSync(this.uploadLegalFilesDir, { recursive: true });
    writeFileSync(join(this.uploadLegalFilesDir, diskName), file.buffer);

    return {
      url: `/upload/${LEGAL_FILES_SUBDIR}/${diskName}`,
      fileName: file.originalname
    };
  }
}
