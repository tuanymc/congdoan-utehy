import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type {
  JwtAccessPayload,
  LegalExamAttemptDto,
  LegalExamAttemptKind,
  LegalExamSubmitResultDto,
  MyLegalExamAttemptListItemDto
} from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LegalEducationService } from "./legal-education.service";
import { SaveLegalExamAnswersDto } from "./dto/save-answers.dto";
import { StartLegalExamAttemptDto } from "./dto/start-attempt.dto";

/**
 * Thi trắc nghiệm — bắt buộc đăng nhập (mọi vai trò), KHÔNG cần permission admin. Giống PublicAiToolsController.
 * SkipThrottle: trang thi tự lưu đáp án mỗi lần chọn; không được dính hạn mức chung (đặc biệt khi
 * nhiều đoàn viên cùng thi qua 1 IP NAT / IIS proxy).
 */
@SkipThrottle()
@ApiBearerAuth()
@ApiTags("member-legal-exams")
@UseGuards(JwtAuthGuard)
@Controller("legal-education")
export class MemberLegalExamsController {
  constructor(private readonly legalEducation: LegalEducationService) {}

  @Get("me/attempts")
  listMine(@CurrentUser() user: JwtAccessPayload): Promise<MyLegalExamAttemptListItemDto[]> {
    return this.legalEducation.listMyAttempts(user.sub);
  }

  @Post("exams/:id/entry-code")
  resendEntryCode(@Param("id") id: string, @CurrentUser() user: JwtAccessPayload): Promise<{ maskedEmail: string }> {
    return this.legalEducation.resendEntryCode(id, user.sub);
  }

  @Post("exams/:id/attempts")
  start(
    @Param("id") id: string,
    @CurrentUser() user: JwtAccessPayload,
    @Query("kind") kind?: string,
    @Body() dto?: StartLegalExamAttemptDto
  ): Promise<LegalExamAttemptDto> {
    const requested: LegalExamAttemptKind | undefined =
      kind === "PRACTICE" || kind === "OFFICIAL" ? kind : undefined;
    return this.legalEducation.startOrResumeAttempt(id, user.sub, requested, dto?.entryCode);
  }

  @Patch("exams/:id/attempts/:attemptId")
  save(
    @Param("id") id: string,
    @Param("attemptId") attemptId: string,
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: SaveLegalExamAnswersDto
  ): Promise<{ ok: true }> {
    return this.legalEducation.saveAnswers(id, attemptId, user.sub, dto);
  }

  @Post("exams/:id/attempts/:attemptId/submit")
  submit(
    @Param("id") id: string,
    @Param("attemptId") attemptId: string,
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: SaveLegalExamAnswersDto
  ): Promise<LegalExamSubmitResultDto> {
    return this.legalEducation.submitAttempt(id, attemptId, user.sub, dto);
  }
}
