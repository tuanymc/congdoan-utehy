import { PartialType } from "@nestjs/swagger";
import { CreateLegalEducationMaterialDto } from "./create-material.dto";

export class UpdateLegalEducationMaterialDto extends PartialType(CreateLegalEducationMaterialDto) {}
