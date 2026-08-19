import { PartialType } from "@nestjs/swagger";
import { CreateUnionDepartmentDto } from "./create-union-department.dto";

export class UpdateUnionDepartmentDto extends PartialType(CreateUnionDepartmentDto) {}
