import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PublicSurveyDetailDto, PublicSurveyListItemDto, SubmitSurveyResponseResultDto } from "@congdoan/types";
import { SurveysService } from "./surveys.service";
import { SubmitSurveyResponseDto } from "./dto/submit-survey-response.dto";

/**
 * Endpoint công khai — trang "Khảo sát ý kiến" trong Tiện ích số. KHÔNG có JwtAuthGuard — CHỈ trả
 * khảo sát isOpen=true, cho phép gửi trả lời không cần đăng nhập (giống PublicEventsController, xem
 * ghi chú model Survey trong prisma/schema.prisma).
 */
@ApiTags("public-surveys")
@Controller("surveys")
export class PublicSurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  // Không phân trang — số khảo sát đang mở (isOpen=true) thường rất ít, giống cách listPublic() các
  // module nhỏ khác (vd AiToolsService) trả thẳng mảng đầy đủ.
  @Get()
  list(): Promise<PublicSurveyListItemDto[]> {
    return this.surveysService.listPublic();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<PublicSurveyDetailDto> {
    return this.surveysService.findOnePublic(id);
  }

  @Post(":id/responses")
  async submitResponse(
    @Param("id") id: string,
    @Body() dto: SubmitSurveyResponseDto
  ): Promise<SubmitSurveyResponseResultDto> {
    // Trả JSON `{ ok: true }` (201 + body), không dùng 204 rỗng: production IIS ARR chuyển tiếp
    // 201/204 Content-Length=0, apiFetch coi body rỗng là lỗi dù đã lưu thành công.
    await this.surveysService.submitResponse(id, dto);
    return { ok: true };
  }
}
