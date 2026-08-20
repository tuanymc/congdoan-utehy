import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PublicSurveyDetailDto, PublicSurveyListItemDto } from "@congdoan/types";
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
  @HttpCode(HttpStatus.CREATED)
  submitResponse(@Param("id") id: string, @Body() dto: SubmitSurveyResponseDto): Promise<void> {
    return this.surveysService.submitResponse(id, dto);
  }
}
