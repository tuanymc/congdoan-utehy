import { Module } from "@nestjs/common";
import { UnionDepartmentsController } from "./union-departments.controller";
import { AdminUnionDepartmentsController } from "./admin-union-departments.controller";
import { UnionMembersController } from "./union-members.controller";
import { AdminUnionMembersController } from "./admin-union-members.controller";
import { MeUnionMemberController } from "./me-union-member.controller";
import { UnionDepartmentsService } from "./union-departments.service";
import { UnionMembersService } from "./union-members.service";
import { UnionMembersExcelService } from "./union-members-excel.service";
import { UnionMembersLoginService } from "./union-members-login.service";
import { AuditLogService } from "../../common/audit-log.service";
import { MailService } from "../../common/mail.service";

@Module({
  controllers: [
    UnionDepartmentsController,
    AdminUnionDepartmentsController,
    UnionMembersController,
    AdminUnionMembersController,
    MeUnionMemberController
  ],
  providers: [
    UnionDepartmentsService,
    UnionMembersService,
    UnionMembersExcelService,
    UnionMembersLoginService,
    MailService,
    AuditLogService
  ]
})
export class UnionDirectoryModule {}
