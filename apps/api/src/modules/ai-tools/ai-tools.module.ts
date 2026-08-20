import { Module } from "@nestjs/common";
import { AdminAiToolsController } from "./admin-ai-tools.controller";
import { PublicAiToolsController } from "./public-ai-tools.controller";
import { AiToolsService } from "./ai-tools.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [AdminAiToolsController, PublicAiToolsController],
  providers: [AiToolsService, AuditLogService]
})
export class AiToolsModule {}
