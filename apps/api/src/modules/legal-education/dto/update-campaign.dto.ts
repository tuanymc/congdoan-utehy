import { PartialType } from "@nestjs/swagger";
import { CreateLegalEducationCampaignDto } from "./create-campaign.dto";

export class UpdateLegalEducationCampaignDto extends PartialType(CreateLegalEducationCampaignDto) {}
