import { PartialType } from "@nestjs/swagger";
import { CreateUnionCommitteeMemberDto } from "./create-union-committee-member.dto";

export class UpdateUnionCommitteeMemberDto extends PartialType(CreateUnionCommitteeMemberDto) {}
