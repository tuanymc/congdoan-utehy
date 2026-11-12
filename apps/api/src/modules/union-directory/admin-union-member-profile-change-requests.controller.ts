import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, UnionMemberProfileChangeRequestDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UnionMemberProfileChangeRequestsService } from "./union-member-profile-change-requests.service";
import { ReviewProfileChangeDto } from "./dto/review-profile-change.dto";

/** Duyệt yêu cầu đổi ảnh/chức vụ/trình độ — dùng quyền unionmember:view / unionmember:update sẵn có
 * (ADMIN + UNION_CLERK), không thêm module permission mới để không phải seed lại production. */
@ApiBearerAuth()
@ApiTags("admin-union-member-profile-change-requests")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/union-member-profile-change-requests")
export class AdminUnionMemberProfileChangeRequestsController {
  constructor(private readonly profileChanges: UnionMemberProfileChangeRequestsService) {}

  @RequirePermissions("unionmember:view")
  @Get()
  list(): Promise<UnionMemberProfileChangeRequestDto[]> {
    return this.profileChanges.listForAdmin();
  }

  @RequirePermissions("unionmember:update")
  @Post(":id/approve")
  approve(
    @Param("id") id: string,
    @Body() dto: ReviewProfileChangeDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UnionMemberProfileChangeRequestDto> {
    return this.profileChanges.approve(id, actor.sub, dto.reviewNote);
  }

  @RequirePermissions("unionmember:update")
  @Post(":id/reject")
  reject(
    @Param("id") id: string,
    @Body() dto: ReviewProfileChangeDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UnionMemberProfileChangeRequestDto> {
    return this.profileChanges.reject(id, actor.sub, dto.reviewNote);
  }
}
