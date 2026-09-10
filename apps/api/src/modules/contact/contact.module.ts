import { Module } from "@nestjs/common";
import { ContactMessagesController } from "./contact-messages.controller";
import { AdminContactMessagesController } from "./admin-contact-messages.controller";
import { ContactMessagesService } from "./contact-messages.service";
import { AuditLogService } from "../../common/audit-log.service";
import { MailService } from "../../common/mail.service";

@Module({
  controllers: [ContactMessagesController, AdminContactMessagesController],
  providers: [ContactMessagesService, MailService, AuditLogService]
})
export class ContactModule {}
