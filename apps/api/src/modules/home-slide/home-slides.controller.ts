import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { HomeSlideDto } from "@congdoan/types";
import { HomeSlidesService } from "./home-slides.service";

/** Endpoint công khai — slider đầu trang chủ (thay tblSlide/uc_Slide.ascx web cũ). */
@ApiTags("home-slides")
@Controller("home-slides")
export class HomeSlidesController {
  constructor(private readonly homeSlidesService: HomeSlidesService) {}

  @Get()
  list(): Promise<HomeSlideDto[]> {
    return this.homeSlidesService.listActive();
  }
}
