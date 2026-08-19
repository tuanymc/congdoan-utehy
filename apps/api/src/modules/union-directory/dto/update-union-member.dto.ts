import { PartialType } from "@nestjs/swagger";
import { CreateUnionMemberDto } from "./create-union-member.dto";

export class UpdateUnionMemberDto extends PartialType(CreateUnionMemberDto) {}
