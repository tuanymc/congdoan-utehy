/**
 * Domain Contact — form "Liên hệ" trang công khai. Tính năng MỚI hoàn toàn cho web mới (web cũ có
 * bảng tblContact nhưng KHÔNG có form/code-behind nào ghi vào đó — đã grep xác nhận, xem chú thích
 * domain block CONTACT trong prisma/schema.prisma).
 */

export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateContactMessageRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}
