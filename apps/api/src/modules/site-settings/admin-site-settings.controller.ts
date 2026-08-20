import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, SiteSettingDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SiteSettingsService } from "./site-settings.service";
import { UpdateSiteSettingDto } from "./dto/update-site-setting.dto";

/** Cấu hình chung cho trang quản trị — bảo vệ theo permission "sitesetting:*" (xem prisma/seed.ts:
 * CHỈ ADMIN có quyền này — không nằm trong clerkManagedModules vì đây là thông tin định danh/SEO
 * toàn site, không phải nội dung công khai vận hành hàng ngày như banner/công văn). Chỉ 1 dòng duy
 * nhất nên không có endpoint tạo/xoá, chỉ GET (xem hiện tại) + PATCH (cập nhật 1 phần). */
@ApiBearerAuth()
@ApiTags("admin-site-settings")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/site-settings")
export class AdminSiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @RequirePermissions("sitesetting:view")
  @Get()
  get(): Promise<SiteSettingDto> {
    return this.siteSettingsService.getOrCreate();
  }

  @RequirePermissions("sitesetting:update")
  @Patch()
  update(@Body() dto: UpdateSiteSettingDto, @CurrentUser() actor: JwtAccessPayload): Promise<SiteSettingDto> {
    return this.siteSettingsService.update(dto, actor.sub);
  }
}
