import { Module } from "@nestjs/common";
import { AdminSurveysController } from "./admin-surveys.controller";
import { PublicSurveysController } from "./public-surveys.controller";
import { SurveysService } from "./surveys.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [AdminSurveysController, PublicSurveysController],
  providers: [SurveysService, AuditLogService]
})
export class SurveysModule {}
