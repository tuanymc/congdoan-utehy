import { Module } from "@nestjs/common";
import { AdminPublicServiceProceduresController } from "./admin-public-service-procedures.controller";
import { PublicServiceProceduresController } from "./public-service-procedures.controller";
import { AdminPublicServiceLinksController } from "./admin-public-service-links.controller";
import { PublicServiceLinksController } from "./public-service-links.controller";
import { AdminPublicServiceNoticesController } from "./admin-public-service-notices.controller";
import { PublicServiceNoticesController } from "./public-service-notices.controller";
import { AdminPublicServiceSupportRequestsController } from "./admin-public-service-support-requests.controller";
import { PublicServiceSupportRequestsController } from "./public-service-support-requests.controller";
import { PublicServiceProceduresService } from "./public-service-procedures.service";
import { PublicServiceLinksService } from "./public-service-links.service";
import { PublicServiceNoticesService } from "./public-service-notices.service";
import { PublicServiceSupportRequestsService } from "./public-service-support-requests.service";
import { AuditLogService } from "../../common/audit-log.service";

/** "Dịch vụ công" (Tiện ích số, Phase 4e) — gộp 4 sub-resource (thủ tục/liên kết/yêu cầu hỗ trợ/thông
 * báo) vào 1 module, cùng khuôn OfficialDocumentsModule (DocumentType + OfficialDocument +
 * DocumentAttachment gộp 1 module) — vì đây là 1 tính năng thống nhất "Dịch vụ công" trong mắt người
 * dùng, dù có nhiều model CSDL riêng biệt. */
@Module({
  controllers: [
    AdminPublicServiceProceduresController,
    PublicServiceProceduresController,
    AdminPublicServiceLinksController,
    PublicServiceLinksController,
    AdminPublicServiceNoticesController,
    PublicServiceNoticesController,
    AdminPublicServiceSupportRequestsController,
    PublicServiceSupportRequestsController
  ],
  providers: [PublicServiceProceduresService, PublicServiceLinksService, PublicServiceNoticesService, PublicServiceSupportRequestsService, AuditLogService]
})
export class PublicServicesModule {}
