import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, SurveyDetailDto, SurveyDto, SurveyQuestionDto, SurveyResultsDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SurveysService } from "./surveys.service";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";
import { CreateSurveyQuestionDto } from "./dto/create-survey-question.dto";
import { UpdateSurveyQuestionDto } from "./dto/update-survey-question.dto";

/** CRUD "Khảo sát ý kiến" — bảo vệ theo permission "survey:*" (mặc định: ADMIN, UNION_CLERK). Câu hỏi
 * là tài nguyên con của khảo sát (/admin/surveys/:id/questions) — dùng chung permission "survey:update"
 * (thêm/sửa/xoá câu hỏi coi như 1 dạng chỉnh sửa khảo sát, không tách permission riêng cho đơn giản). */
@ApiBearerAuth()
@ApiTags("admin-surveys")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/surveys")
export class AdminSurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @RequirePermissions("survey:view")
  @Get()
  list(): Promise<SurveyDto[]> {
    return this.surveysService.listForAdmin();
  }

  @RequirePermissions("survey:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<SurveyDetailDto> {
    return this.surveysService.findOne(id);
  }

  @RequirePermissions("survey:view")
  @Get(":id/results")
  getResults(@Param("id") id: string): Promise<SurveyResultsDto> {
    return this.surveysService.getResults(id);
  }

  @RequirePermissions("survey:create")
  @Post()
  create(@Body() dto: CreateSurveyDto, @CurrentUser() actor: JwtAccessPayload): Promise<SurveyDto> {
    return this.surveysService.create(dto, actor.sub);
  }

  @RequirePermissions("survey:update")
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSurveyDto, @CurrentUser() actor: JwtAccessPayload): Promise<SurveyDto> {
    return this.surveysService.update(id, dto, actor.sub);
  }

  @RequirePermissions("survey:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.surveysService.remove(id, actor.sub);
  }

  @RequirePermissions("survey:update")
  @Post(":id/questions")
  addQuestion(
    @Param("id") id: string,
    @Body() dto: CreateSurveyQuestionDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<SurveyQuestionDto> {
    return this.surveysService.addQuestion(id, dto, actor.sub);
  }

  @RequirePermissions("survey:update")
  @Patch(":id/questions/:questionId")
  updateQuestion(
    @Param("id") id: string,
    @Param("questionId") questionId: string,
    @Body() dto: UpdateSurveyQuestionDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<SurveyQuestionDto> {
    return this.surveysService.updateQuestion(id, questionId, dto, actor.sub);
  }

  @RequirePermissions("survey:update")
  @Delete(":id/questions/:questionId")
  removeQuestion(
    @Param("id") id: string,
    @Param("questionId") questionId: string,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<void> {
    return this.surveysService.removeQuestion(id, questionId, actor.sub);
  }
}
