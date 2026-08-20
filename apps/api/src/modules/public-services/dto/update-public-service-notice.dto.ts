import { PartialType } from "@nestjs/swagger";
import { CreatePublicServiceNoticeDto } from "./create-public-service-notice.dto";

export class UpdatePublicServiceNoticeDto extends PartialType(CreatePublicServiceNoticeDto) {}
