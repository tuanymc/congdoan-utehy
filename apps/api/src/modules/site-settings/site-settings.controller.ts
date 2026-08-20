import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { SiteSettingDto } from "@congdoan/types";
import { SiteSettingsService } from "./site-settings.service";

/** Endpoint công khai — cấu hình chung toàn site cho apps/web (Header, Footer, thẻ <title>/<meta>). */
@ApiTags("site-settings")
@Controller("site-settings")
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  get(): Promise<SiteSettingDto> {
    return this.siteSettingsService.getOrCreate();
  }
}
