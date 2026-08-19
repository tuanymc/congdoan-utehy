import { Module } from "@nestjs/common";
import { UnionDepartmentsController } from "./union-departments.controller";
import { AdminUnionDepartmentsController } from "./admin-union-departments.controller";
import { UnionMembersController } from "./union-members.controller";
import { AdminUnionMembersController } from "./admin-union-members.controller";
import { UnionDepartmentsService } from "./union-departments.service";
import { UnionMembersService } from "./union-members.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [
    UnionDepartmentsController,
    AdminUnionDepartmentsController,
    UnionMembersController,
    AdminUnionMembersController
  ],
  providers: [UnionDepartmentsService, UnionMembersService, AuditLogService]
})
export class UnionDirectoryModule {}
