import { Module } from "@nestjs/common";
import { UnionTermsController } from "./union-terms.controller";
import { AdminUnionTermsController } from "./admin-union-terms.controller";
import { UnionCommitteeMembersController } from "./union-committee-members.controller";
import { AdminUnionCommitteeMembersController } from "./admin-union-committee-members.controller";
import { UnionTermsService } from "./union-terms.service";
import { UnionCommitteeMembersService } from "./union-committee-members.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [
    UnionTermsController,
    AdminUnionTermsController,
    UnionCommitteeMembersController,
    AdminUnionCommitteeMembersController
  ],
  providers: [UnionTermsService, UnionCommitteeMembersService, AuditLogService]
})
export class UnionLeadershipModule {}
