import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type {
  EventDetailDto,
  EventDto,
  EventRegistrationDto,
  JwtAccessPayload,
  PaginatedResult
} from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

/** CRUD "Đăng ký hoạt động" — bảo vệ theo permission "event:*" (mặc định: ADMIN, UNION_CLERK). */
@ApiBearerAuth()
@ApiTags("admin-events")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/events")
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @RequirePermissions("event:view")
  @Get()
  list(@Query() query: PaginationQueryDto): Promise<PaginatedResult<EventDto>> {
    return this.eventsService.listForAdmin(query);
  }

  @RequirePermissions("event:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<EventDetailDto> {
    return this.eventsService.findOne(id);
  }

  // Chỉ cần "event:view" — xem danh sách người đăng ký là 1 dạng xem chi tiết hoạt động, không phải
  // thao tác chỉnh sửa.
  @RequirePermissions("event:view")
  @Get(":id/registrations")
  listRegistrations(@Param("id") id: string): Promise<EventRegistrationDto[]> {
    return this.eventsService.listRegistrations(id);
  }

  @RequirePermissions("event:create")
  @Post()
  create(@Body() dto: CreateEventDto, @CurrentUser() actor: JwtAccessPayload): Promise<EventDetailDto> {
    return this.eventsService.create(dto, actor.sub);
  }

  @RequirePermissions("event:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<EventDetailDto> {
    return this.eventsService.update(id, dto, actor.sub);
  }

  @RequirePermissions("event:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.eventsService.remove(id, actor.sub);
  }
}
