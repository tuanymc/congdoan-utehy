import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

/** Chỉ dùng để đánh dấu đã đọc/chưa đọc — tin nhắn liên hệ không có field nào khác cho phép admin sửa. */
export class UpdateContactMessageDto {
  @ApiProperty()
  @IsBoolean()
  isRead!: boolean;
}
