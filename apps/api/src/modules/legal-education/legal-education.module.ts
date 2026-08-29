import { Module } from "@nestjs/common";
import { AdminLegalEducationController } from "./admin-legal-education.controller";
import { MemberLegalExamsController } from "./member-legal-exams.controller";
import { PublicLegalEducationController } from "./public-legal-education.controller";
import { LegalEducationService } from "./legal-education.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [AdminLegalEducationController, MemberLegalExamsController, PublicLegalEducationController],
  providers: [LegalEducationService, AuditLogService]
})
export class LegalEducationModule {}
