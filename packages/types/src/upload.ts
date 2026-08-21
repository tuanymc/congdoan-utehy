/** Kết quả upload ảnh qua POST /admin/uploads/images — URL root-relative để IIS phục vụ từ web/upload/. */
export interface UploadImageResponseDto {
  /** Đường dẫn công khai, vd "/upload/images/admin-uploads/uuid-ten.jpg". */
  url: string;
  /** Tên file gốc do người dùng chọn (đã làm sạch khi lưu đĩa). */
  fileName: string;
}
