import { PartialType } from "@nestjs/swagger";
import { CreateUnionTermDto } from "./create-union-term.dto";

export class UpdateUnionTermDto extends PartialType(CreateUnionTermDto) {}
