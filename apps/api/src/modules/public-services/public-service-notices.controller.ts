import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PublicServiceNoticePublicDto } from "@congdoan/types";
import { PublicServiceNoticesService } from "./public-service-notices.service";

/** Endpoint công khai — "Cảnh báo và nhắc việc". KHÔNG JwtAuthGuard, KHÔNG cá nhân hoá — CHỈ trả thông
 * báo isActive=true, ghim lên đầu (xem ghi chú model PublicServiceNotice trong schema.prisma). */
@ApiTags("public-service-notices")
@Controller("public-service-notices")
export class PublicServiceNoticesController {
  constructor(private readonly noticesService: PublicServiceNoticesService) {}

  @Get()
  list(): Promise<PublicServiceNoticePublicDto[]> {
    return this.noticesService.listPublic();
  }
}
