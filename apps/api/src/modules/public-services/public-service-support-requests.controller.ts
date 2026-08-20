import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PublicServiceSupportRequestDto } from "@congdoan/types";
import { PublicServiceSupportRequestsService } from "./public-service-support-requests.service";
import { CreatePublicServiceSupportRequestDto } from "./dto/create-public-service-support-request.dto";

/** Endpoint công khai — gửi yêu cầu "Công đoàn hỗ trợ tôi". KHÔNG JwtAuthGuard — cùng chính sách "không
 * bắt buộc đăng nhập" như EventRegistration/SurveyResponse (xem PublicServiceSupportRequestsService.submit
 * cho điều kiện bắt buộc có ít nhất 1 trong 2 phone/email). CHỈ có POST — xem/triage ở trang quản trị. */
@ApiTags("public-service-support-requests")
@Controller("public-service-support-requests")
export class PublicServiceSupportRequestsController {
  constructor(private readonly supportRequestsService: PublicServiceSupportRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  submit(@Body() dto: CreatePublicServiceSupportRequestDto): Promise<PublicServiceSupportRequestDto> {
    return this.supportRequestsService.submit(dto);
  }
}
