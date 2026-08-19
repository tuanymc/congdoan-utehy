import { Injectable, NotFoundException } from "@nestjs/common";
import type { ContactMessageDto, PaginatedResult, PaginationQuery } from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateContactMessageDto } from "./dto/create-contact-message.dto";

function toDto(m: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
}): ContactMessageDto {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    message: m.message,
    isRead: m.isRead,
    createdAt: m.createdAt.toISOString()
  };
}

/**
 * Form "Liên hệ" — tính năng MỚI hoàn toàn cho web mới (web cũ KHÔNG có form liên hệ hoạt động thật,
 * xem chú thích domain block CONTACT trong prisma/schema.prisma). Không có luồng phản hồi qua email
 * tự động ở bản MVP này — admin/UNION_CLERK đọc + xử lý thủ công qua trang quản trị, người gửi đã để
 * lại email/số điện thoại trong tin nhắn để liên hệ lại trực tiếp.
 */
@Injectable()
export class ContactMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Công khai — nhận tin nhắn từ form Liên hệ, không cần đăng nhập. */
  async create(dto: CreateContactMessageDto): Promise<ContactMessageDto> {
    const message = await this.prisma.contactMessage.create({
      data: { name: dto.name, email: dto.email, phone: dto.phone, message: dto.message }
    });
    return toDto(message);
  }

  async listForAdmin(query: PaginationQuery & { isRead?: boolean }): Promise<PaginatedResult<ContactMessageDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.ContactMessageWhereInput = {
      ...(query.isRead !== undefined ? { isRead: query.isRead } : {}),
      ...(query.search
        ? { OR: [{ name: { contains: query.search } }, { email: { contains: query.search } }, { message: { contains: query.search } }] }
        : {})
    };

    const [total, messages] = await this.prisma.$transaction([
      this.prisma.contactMessage.count({ where }),
      this.prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize })
    ]);

    return { items: messages.map(toDto), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async markRead(id: string, isRead: boolean): Promise<ContactMessageDto> {
    const existing = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Không tìm thấy tin nhắn liên hệ.");
    const message = await this.prisma.contactMessage.update({ where: { id }, data: { isRead } });
    return toDto(message);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Không tìm thấy tin nhắn liên hệ.");
    await this.prisma.contactMessage.delete({ where: { id } });
  }
}
