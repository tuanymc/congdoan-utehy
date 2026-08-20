import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PublicServiceLinkPublicDto } from "@congdoan/types";
import { PublicServiceLinksService } from "./public-service-links.service";

/** Endpoint công khai — "Kho biểu mẫu và đường dẫn chính thống". KHÔNG JwtAuthGuard — CHỈ trả liên kết
 * isActive=true. FE tự sinh QR code trực tiếp từ `url` (xem ghi chú model PublicServiceLink trong
 * schema.prisma) — endpoint này KHÔNG trả ảnh QR. */
@ApiTags("public-service-links")
@Controller("public-service-links")
export class PublicServiceLinksController {
  constructor(private readonly linksService: PublicServiceLinksService) {}

  @Get()
  list(): Promise<PublicServiceLinkPublicDto[]> {
    return this.linksService.listPublic();
  }
}
