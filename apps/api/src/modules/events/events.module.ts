import { Module } from "@nestjs/common";
import { AdminEventsController } from "./admin-events.controller";
import { PublicEventsController } from "./public-events.controller";
import { EventsService } from "./events.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [AdminEventsController, PublicEventsController],
  providers: [EventsService, AuditLogService]
})
export class EventsModule {}
