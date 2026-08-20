import { PartialType } from "@nestjs/swagger";
import { CreateAiToolResourceDto } from "./create-ai-tool-resource.dto";

export class UpdateAiToolResourceDto extends PartialType(CreateAiToolResourceDto) {}
