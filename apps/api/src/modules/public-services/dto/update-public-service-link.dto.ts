import { PartialType } from "@nestjs/swagger";
import { CreatePublicServiceLinkDto } from "./create-public-service-link.dto";

export class UpdatePublicServiceLinkDto extends PartialType(CreatePublicServiceLinkDto) {}
