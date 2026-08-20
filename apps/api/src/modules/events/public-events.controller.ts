import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { EventRegistrationDto, PaginatedResult, PublicEventDto } from "@congdoan/types";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { EventsService } from "./events.service";
import { CreateEventRegistrationDto } from "./dto/create-event-registration.dto";

/**
 * Endpoint công khai — trang "Đăng ký hoạt động" trong Tiện ích số. KHÔNG có JwtAuthGuard — CHỈ trả
 * hoạt động isPublic=true, và cho phép đăng ký tham gia không cần đăng nhập (xem EventsService.register).
 */
@ApiTags("public-events")
@Controller("events")
export class PublicEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto): Promise<PaginatedResult<PublicEventDto>> {
    return this.eventsService.listPublic(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<PublicEventDto> {
    return this.eventsService.findOnePublic(id);
  }

  @Post(":id/register")
  @HttpCode(HttpStatus.CREATED)
  register(@Param("id") id: string, @Body() dto: CreateEventRegistrationDto): Promise<EventRegistrationDto> {
    return this.eventsService.register(id, dto);
  }
}
