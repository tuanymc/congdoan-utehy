import { Module } from "@nestjs/common";
import { SiteSettingsController } from "./site-settings.controller";
import { AdminSiteSettingsController } from "./admin-site-settings.controller";
import { SiteSettingsService } from "./site-settings.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [SiteSettingsController, AdminSiteSettingsController],
  providers: [SiteSettingsService, AuditLogService]
})
export class SiteSettingsModule {}
