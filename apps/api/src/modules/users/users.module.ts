import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuditLogService } from "../../common/audit-log.service";
import { MailService } from "../../common/mail.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuditLogService, MailService],
  exports: [UsersService]
})
export class UsersModule {}
