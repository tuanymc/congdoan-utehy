import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";
import type { ContactMessageDto } from "@congdoan/types";
import { ContactMessagesService } from "./contact-messages.service";
import { CreateContactMessageDto } from "./dto/create-contact-message.dto";

/** Endpoint công khai — trang "Liên hệ" gửi tin nhắn, không cần đăng nhập. */
@ApiTags("contact")
@Controller("contact-messages")
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  // Siết riêng endpoint này chặt hơn giới hạn chung toàn API (100 request/phút, xem app.module.ts) —
  // form công khai không cần đăng nhập nên dễ bị spam/bot hơn các endpoint khác, 5 request/phút/IP là
  // đủ cho người dùng thật (kể cả gửi lại sau khi sửa lỗi validate) mà vẫn cản được spam thô sơ.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  create(@Body() dto: CreateContactMessageDto): Promise<ContactMessageDto> {
    return this.contactMessagesService.create(dto);
  }
}
