import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PublicServiceProcedureDetailDto, PublicServiceProcedureListItemDto } from "@congdoan/types";
import { PublicServiceProceduresService } from "./public-service-procedures.service";

/** Endpoint công khai — "Tra cứu nhanh dịch vụ công" + "Hướng dẫn từng bước". KHÔNG JwtAuthGuard — CHỈ
 * trả thủ tục isActive=true (xem PublicServiceProceduresService.listPublic/findPublicBySlug). */
@ApiTags("public-service-procedures")
@Controller("public-service-procedures")
export class PublicServiceProceduresController {
  constructor(private readonly proceduresService: PublicServiceProceduresService) {}

  @Get()
  list(@Query("category") category?: string): Promise<PublicServiceProcedureListItemDto[]> {
    return this.proceduresService.listPublic(category);
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string): Promise<PublicServiceProcedureDetailDto> {
    return this.proceduresService.findPublicBySlug(slug);
  }
}
