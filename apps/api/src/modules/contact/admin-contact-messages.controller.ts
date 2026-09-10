import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { ContactMessageDto, JwtAccessPayload, PaginatedResult, ReplyContactMessageResultDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ContactMessagesService } from "./contact-messages.service";
import { QueryContactMessagesDto } from "./dto/query-contact-messages.dto";
import { UpdateContactMessageDto } from "./dto/update-contact-message.dto";
import { ReplyContactMessageDto } from "./dto/reply-contact-message.dto";

/** Hộp thư "Liên hệ" cho trang quản trị — bảo vệ theo permission "contactmessage:*". */
@ApiBearerAuth()
@ApiTags("admin-contact-messages")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/contact-messages")
export class AdminContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @RequirePermissions("contactmessage:view")
  @Get()
  list(@Query() query: QueryContactMessagesDto): Promise<PaginatedResult<ContactMessageDto>> {
    return this.contactMessagesService.listForAdmin(query);
  }

  @RequirePermissions("contactmessage:update")
  @Patch(":id")
  markRead(@Param("id") id: string, @Body() dto: UpdateContactMessageDto): Promise<ContactMessageDto> {
    return this.contactMessagesService.markRead(id, dto.isRead);
  }

  @RequirePermissions("contactmessage:update")
  @Post(":id/reply")
  reply(
    @Param("id") id: string,
    @Body() dto: ReplyContactMessageDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<ReplyContactMessageResultDto> {
    return this.contactMessagesService.reply(id, dto, actor.sub);
  }

  @RequirePermissions("contactmessage:delete")
  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.contactMessagesService.remove(id);
  }
}
