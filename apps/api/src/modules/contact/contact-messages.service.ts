import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  ContactMessageDto,
  PaginatedResult,
  PaginationQuery,
  ReplyContactMessageResultDto
} from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { MailService } from "../../common/mail.service";
import { CreateContactMessageDto } from "./dto/create-contact-message.dto";
import { ReplyContactMessageDto } from "./dto/reply-contact-message.dto";

function toDto(m: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
  repliedAt: Date | null;
  replySubject: string | null;
}): ContactMessageDto {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    message: m.message,
    isRead: m.isRead,
    createdAt: m.createdAt.toISOString(),
    repliedAt: m.repliedAt ? m.repliedAt.toISOString() : null,
    replySubject: m.replySubject
  };
}

function quoteOriginal(message: string): string {
  return message
    .split(/\r?\n/)
    .map((line) => `> ${line}`)
    .join("\n");
}

/**
 * Form "Liên hệ" — tin nhắn từ trang công khai. Admin đọc, đánh dấu đã đọc, xoá, và gửi email phản hồi
 * qua SMTP (cùng MailService với cấp tài khoản công đoàn viên).
 */
@Injectable()
export class ContactMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly auditLog: AuditLogService
  ) {}

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

  async reply(id: string, dto: ReplyContactMessageDto, actorUserId: string): Promise<ReplyContactMessageResultDto> {
    const existing = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Không tìm thấy tin nhắn liên hệ.");
    if (!this.mail.isConfigured()) {
      throw new BadRequestException("Chưa cấu hình SMTP nên không gửi được email phản hồi.");
    }

    const sentAt = new Date();
    const emailBody = [
      dto.body.trim(),
      "",
      "-----",
      `Tin nhắn gốc của bạn gửi lúc ${existing.createdAt.toLocaleString("vi-VN")}:`,
      quoteOriginal(existing.message),
      "",
      "Trân trọng,",
      "Công đoàn Trường Đại học Công nghệ Kỹ thuật Hưng Yên"
    ].join("\n");

    const emailSent = await this.mail.sendMail(existing.email, dto.subject.trim(), emailBody);
    if (!emailSent) {
      throw new BadRequestException(`Không gửi được email tới ${existing.email}. Kiểm tra cấu hình SMTP rồi thử lại.`);
    }

    await this.prisma.contactMessage.update({
      where: { id },
      data: {
        isRead: true,
        repliedAt: sentAt,
        replySubject: dto.subject.trim(),
        replyBody: dto.body.trim()
      }
    });
    await this.auditLog.record({
      actorUserId,
      action: "update",
      entityType: "ContactMessage",
      entityId: id,
      changes: { repliedAt: { before: existing.repliedAt?.toISOString() ?? null, after: sentAt.toISOString() } }
    });

    return { emailSent: true };
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Không tìm thấy tin nhắn liên hệ.");
    await this.prisma.contactMessage.delete({ where: { id } });
  }
}
