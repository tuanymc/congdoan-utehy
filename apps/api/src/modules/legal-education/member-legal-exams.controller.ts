import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, LegalExamAttemptDto, LegalExamSubmitResultDto, MyLegalExamAttemptListItemDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LegalEducationService } from "./legal-education.service";
import { SaveLegalExamAnswersDto } from "./dto/save-answers.dto";

/**
 * Thi trắc nghiệm — bắt buộc đăng nhập (mọi vai trò), KHÔNG cần permission admin. Giống PublicAiToolsController.
 */
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

  @Post("exams/:id/attempts")
  start(
    @Param("id") id: string,
    @CurrentUser() user: JwtAccessPayload
  ): Promise<LegalExamAttemptDto> {
    return this.legalEducation.startOrResumeAttempt(id, user.sub);
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
