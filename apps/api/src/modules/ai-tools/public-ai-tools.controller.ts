import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { PublicAiToolResourceDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AiToolsService } from "./ai-tools.service";

/**
 * Endpoint công khai — trang "Kho công cụ AI" trong Tiện ích số, yêu cầu ĐĂNG NHẬP (đã xác nhận với
 * người quản trị: chỉ đoàn viên đăng nhập mới xem được) nhưng KHÔNG yêu cầu permission riêng — chỉ
 * JwtAuthGuard đơn thuần (bất kỳ role nào: ADMIN/UNION_CLERK/DEPARTMENT_OFFICER/MEMBER), giống pattern
 * GET /auth/me. Khác PublicEventsController (Phase 4b) — feature đó KHÔNG cần đăng nhập.
 */
@ApiBearerAuth()
@ApiTags("public-ai-tools")
@UseGuards(JwtAuthGuard)
@Controller("ai-tools")
export class PublicAiToolsController {
  constructor(private readonly aiToolsService: AiToolsService) {}

  @Get()
  list(): Promise<PublicAiToolResourceDto[]> {
    return this.aiToolsService.listPublic();
  }
}
