import { Module } from "@nestjs/common";
import { HomeSlidesController } from "./home-slides.controller";
import { AdminHomeSlidesController } from "./admin-home-slides.controller";
import { HomeSlidesService } from "./home-slides.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [HomeSlidesController, AdminHomeSlidesController],
  providers: [HomeSlidesService, AuditLogService]
})
export class HomeSlideModule {}
