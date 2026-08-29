import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PublicLegalCampaignDetailDto, PublicLegalCampaignListItemDto, PublicLegalMaterialDetailDto } from "@congdoan/types";
import { LegalEducationService } from "./legal-education.service";

/**
 * Endpoint công khai — đọc tài liệu phổ biến pháp luật. KHÔNG JwtAuthGuard, KHÔNG trả câu hỏi/đáp án.
 */
@ApiTags("public-legal-education")
@Controller("legal-education")
export class PublicLegalEducationController {
  constructor(private readonly legalEducation: LegalEducationService) {}

  @Get("campaigns")
  list(): Promise<PublicLegalCampaignListItemDto[]> {
    return this.legalEducation.listPublicCampaigns();
  }

  @Get("campaigns/:slug")
  findOne(@Param("slug") slug: string): Promise<PublicLegalCampaignDetailDto> {
    return this.legalEducation.findPublicCampaign(slug);
  }

  @Get("campaigns/:slug/materials/:materialSlug")
  findMaterial(
    @Param("slug") slug: string,
    @Param("materialSlug") materialSlug: string
  ): Promise<PublicLegalMaterialDetailDto> {
    return this.legalEducation.findPublicMaterial(slug, materialSlug);
  }
}
