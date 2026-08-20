import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  EventDetailDto,
  EventDto,
  EventRegistrationDto,
  PaginatedResult,
  PaginationQuery,
  PublicEventDto
} from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { CreateEventRegistrationDto } from "./dto/create-event-registration.dto";

const eventWithCount = Prisma.validator<Prisma.EventDefaultArgs>()({
  include: { _count: { select: { registrations: true } } }
});
type EventWithCount = Prisma.EventGetPayload<typeof eventWithCount>;

function toDto(e: EventWithCount): EventDto {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startAt: e.startAt ? e.startAt.toISOString() : null,
    endAt: e.endAt ? e.endAt.toISOString() : null,
    registrationDeadline: e.registrationDeadline ? e.registrationDeadline.toISOString() : null,
    capacity: e.capacity,
    isPublic: e.isPublic,
    registrationCount: e._count.registrations,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString()
  };
}

function toDetail(e: EventWithCount): EventDetailDto {
  return { ...toDto(e), registrationCount: e._count.registrations };
}

function toPublicDto(e: EventWithCount): PublicEventDto {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startAt: e.startAt ? e.startAt.toISOString() : null,
    endAt: e.endAt ? e.endAt.toISOString() : null,
    registrationDeadline: e.registrationDeadline ? e.registrationDeadline.toISOString() : null,
    isFull: e.capacity != null && e._count.registrations >= e.capacity
  };
}

function toRegistrationDto(r: {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  note: string | null;
  registeredAt: Date;
}): EventRegistrationDto {
  return {
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    phone: r.phone,
    note: r.note,
    registeredAt: r.registeredAt.toISOString()
  };
}

/**
 * CRUD "Đăng ký hoạt động" (Tiện ích số, Phase 4b) — các method không hậu tố "Public" chỉ dùng ở
 * trang quản trị (permission "event:*"). register()/listPublic()/findOnePublic() phục vụ route công
 * khai (không JWT) — xem PublicEventsController.
 */
@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async listForAdmin(query: PaginationQuery): Promise<PaginatedResult<EventDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.EventWhereInput = query.search ? { title: { contains: query.search } } : {};

    const [total, events] = await this.prisma.$transaction([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        ...eventWithCount,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return { items: events.map(toDto), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string): Promise<EventDetailDto> {
    const event = await this.prisma.event.findUnique({ where: { id }, ...eventWithCount });
    if (!event) throw new NotFoundException("Không tìm thấy hoạt động.");
    return toDetail(event);
  }

  async listRegistrations(eventId: string): Promise<EventRegistrationDto[]> {
    await this.findOne(eventId);
    const registrations = await this.prisma.eventRegistration.findMany({
      where: { eventId },
      orderBy: { registeredAt: "desc" }
    });
    return registrations.map(toRegistrationDto);
  }

  async create(dto: CreateEventDto, actorUserId: string): Promise<EventDetailDto> {
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : undefined,
        capacity: dto.capacity,
        isPublic: dto.isPublic ?? true
      },
      ...eventWithCount
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "Event", entityId: event.id });
    return toDetail(event);
  }

  async update(id: string, dto: UpdateEventDto, actorUserId: string): Promise<EventDetailDto> {
    await this.findOne(id);
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : undefined,
        capacity: dto.capacity,
        isPublic: dto.isPublic
      },
      ...eventWithCount
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "Event", entityId: id });
    return toDetail(event);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    // onDelete: Cascade trên EventRegistration.event (xem schema.prisma) — xoá hoạt động tự xoá luôn
    // toàn bộ lượt đăng ký, không cần tự xoá children ở tầng service như MenuItem/DocumentType.
    await this.prisma.event.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "Event", entityId: id });
  }

  /** Công khai — CHỈ hoạt động isPublic=true, sắp theo ngày bắt đầu gần nhất trước (khác listForAdmin
   * sắp theo mới tạo trước) vì đây là trang cho đoàn viên xem "sắp diễn ra hoạt động gì". */
  async listPublic(query: PaginationQuery): Promise<PaginatedResult<PublicEventDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.EventWhereInput = {
      isPublic: true,
      ...(query.search ? { title: { contains: query.search } } : {})
    };

    const [total, events] = await this.prisma.$transaction([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        ...eventWithCount,
        orderBy: { startAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return { items: events.map(toPublicDto), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOnePublic(id: string): Promise<PublicEventDto> {
    const event = await this.prisma.event.findFirst({ where: { id, isPublic: true }, ...eventWithCount });
    if (!event) throw new NotFoundException("Không tìm thấy hoạt động.");
    return toPublicDto(event);
  }

  /** Đăng ký tham gia — công khai, không yêu cầu đăng nhập. Tự kiểm tra hạn đăng ký/số lượng còn
   * trống TRƯỚC khi insert (kiểm tra sớm, thông báo rõ ràng), đồng thời vẫn dựa vào unique constraint
   * [eventId, email] ở tầng CSDL làm lớp chặn cuối cùng chống đăng ký trùng do 2 request cùng lúc
   * (race condition) — bắt lỗi P2002 để trả thông báo thân thiện thay vì lỗi 500. */
  async register(eventId: string, dto: CreateEventRegistrationDto): Promise<EventRegistrationDto> {
    const event = await this.prisma.event.findFirst({ where: { id: eventId, isPublic: true }, ...eventWithCount });
    if (!event) throw new NotFoundException("Không tìm thấy hoạt động.");

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new BadRequestException("Đã hết hạn đăng ký hoạt động này.");
    }
    if (event.capacity != null && event._count.registrations >= event.capacity) {
      throw new BadRequestException("Hoạt động đã đủ số lượng đăng ký.");
    }

    try {
      const registration = await this.prisma.eventRegistration.create({
        data: { eventId, fullName: dto.fullName, email: dto.email, phone: dto.phone, note: dto.note }
      });
      return toRegistrationDto(registration);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Email này đã đăng ký hoạt động này rồi.");
      }
      throw error;
    }
  }
}
