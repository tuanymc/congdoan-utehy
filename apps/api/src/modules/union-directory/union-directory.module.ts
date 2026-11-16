import { Module } from "@nestjs/common";
import { UnionDepartmentsController } from "./union-departments.controller";
import { AdminUnionDepartmentsController } from "./admin-union-departments.controller";
import { UnionMembersController } from "./union-members.controller";
import { AdminUnionMembersController } from "./admin-union-members.controller";
import { MeUnionMemberController } from "./me-union-member.controller";
import { MeDepartmentMembersController } from "./me-department-members.controller";
import { AdminUnionMemberProfileChangeRequestsController } from "./admin-union-member-profile-change-requests.controller";
import { UnionDepartmentsService } from "./union-departments.service";
import { UnionMembersService } from "./union-members.service";
import { UnionMembersExcelService } from "./union-members-excel.service";
import { UnionMembersLoginService } from "./union-members-login.service";
import { UnionMemberProfileChangeRequestsService } from "./union-member-profile-change-requests.service";
import { DepartmentMembersService } from "./department-members.service";
import { AuditLogService } from "../../common/audit-log.service";
import { MailService } from "../../common/mail.service";
import { UploadsModule } from "../uploads/uploads.module";

@Module({
  imports: [UploadsModule],
  controllers: [
    UnionDepartmentsController,
    AdminUnionDepartmentsController,
    UnionMembersController,
    AdminUnionMembersController,
    MeUnionMemberController,
    MeDepartmentMembersController,
    AdminUnionMemberProfileChangeRequestsController
  ],
  providers: [
    UnionDepartmentsService,
    UnionMembersService,
    UnionMembersExcelService,
    UnionMembersLoginService,
    UnionMemberProfileChangeRequestsService,
    DepartmentMembersService,
    MailService,
    AuditLogService
  ]
})
export class UnionDirectoryModule {}
