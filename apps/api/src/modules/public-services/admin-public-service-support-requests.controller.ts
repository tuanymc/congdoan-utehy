import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, PublicServiceSupportRequestDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PublicServiceSupportRequestsService } from "./public-service-support-requests.service";
import { UpdatePublicServiceSupportRequestDto } from "./dto/update-public-service-support-request.dto";

/** Triage "Công đoàn hỗ trợ tôi" (nhóm 4 của Dịch vụ công, Phase 4e — PHẦN NỔI BẬT NHẤT theo yêu cầu
 * người quản trị) — bảo vệ theo permission "publicservicesupportrequest:*". KHÔNG có create/delete ở
 * đây — yêu cầu chỉ được tạo qua form công khai (xem PublicServiceSupportRequestsController.submit),
 * cán bộ chỉ xem + đổi trạng thái/phân công/ghi chú (cùng khuôn ContactMessage — không xoá được lịch sử
 * yêu cầu hỗ trợ qua trang quản trị này để giữ lại làm bằng chứng/thống kê). */
@ApiBearerAuth()
@ApiTags("admin-public-service-support-requests")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/public-service-support-requests")
export class AdminPublicServiceSupportRequestsController {
  constructor(private readonly supportRequestsService: PublicServiceSupportRequestsService) {}

  @RequirePermissions("publicservicesupportrequest:view")
  @Get()
  list(@Query("status") status?: string): Promise<PublicServiceSupportRequestDto[]> {
    return this.supportRequestsService.listForAdmin(status);
  }

  @RequirePermissions("publicservicesupportrequest:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<PublicServiceSupportRequestDto> {
    return this.supportRequestsService.findOne(id);
  }

  @RequirePermissions("publicservicesupportrequest:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePublicServiceSupportRequestDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<PublicServiceSupportRequestDto> {
    return this.supportRequestsService.update(id, dto, actor.sub);
  }
}
