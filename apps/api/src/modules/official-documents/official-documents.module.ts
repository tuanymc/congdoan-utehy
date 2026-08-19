import { Module } from "@nestjs/common";
import { AdminDocumentTypesController } from "./admin-document-types.controller";
import { AdminOfficialDocumentsController } from "./admin-official-documents.controller";
import { PublicOfficialDocumentsController } from "./public-official-documents.controller";
import { DocumentTypesService } from "./document-types.service";
import { OfficialDocumentsService } from "./official-documents.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [AdminDocumentTypesController, AdminOfficialDocumentsController, PublicOfficialDocumentsController],
  providers: [DocumentTypesService, OfficialDocumentsService, AuditLogService]
})
export class OfficialDocumentsModule {}
