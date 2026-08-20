import { extname } from "node:path";

/**
 * Map đuôi file -> Content-Type, CHỈ cho các định dạng trình duyệt render được trực tiếp (PDF/ảnh) —
 * dùng để phục vụ file đính kèm công văn "xem trực tiếp trên web" (Content-Disposition: inline) thay
 * vì luôn ép tải xuống. Không dùng package "mime"/"mime-types" (có trong node_modules nhưng chỉ là
 * dependency bắc cầu qua express/multer, KHÔNG khai trong apps/api/package.json — pnpm strict
 * node_modules không đảm bảo resolve được phantom dependency) — danh sách nhỏ, tự khai đủ dùng.
 * Đuôi không có trong danh sách (doc/docx/xls/xlsx/zip...) trả về "application/octet-stream" — trình
 * duyệt không tự render được các định dạng này nên vẫn tải xuống dù server gợi ý "inline".
 */
const EXTENSION_MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

export function resolveViewableMimeType(fileName: string): string {
  const ext = extname(fileName).toLowerCase();
  return EXTENSION_MIME_TYPES[ext] ?? "application/octet-stream";
}

/** true nếu đuôi file nằm trong danh sách trình duyệt render trực tiếp được (dùng ở FE để quyết định
 * có hiện khung xem trước nhúng ngay trên trang hay chỉ hiện nút tải về) — giữ đồng bộ với map trên. */
export function isInlineViewableFile(fileName: string): boolean {
  return resolveViewableMimeType(fileName) !== "application/octet-stream";
}
