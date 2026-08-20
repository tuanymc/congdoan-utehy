import { PartialType } from "@nestjs/swagger";
import { CreatePublicServiceProcedureDto } from "./create-public-service-procedure.dto";

export class UpdatePublicServiceProcedureDto extends PartialType(CreatePublicServiceProcedureDto) {}
