import { PartialType } from "@nestjs/swagger";
import { CreateOfficialDocumentDto } from "./create-official-document.dto";

export class UpdateOfficialDocumentDto extends PartialType(CreateOfficialDocumentDto) {}
