import { Body, Controller, Delete, Get, Param, Patch, Post, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import type {
  JwtAccessPayload,
  LegalEducationCampaignDetailDto,
  LegalEducationCampaignDto,
  LegalEducationMaterialDto,
  LegalExamQuestionDto,
  LegalExamQuestionImportResultDto,
  LegalExamResultsDto,
  LegalExamSettingsDto
} from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { LegalEducationService, type UploadedQuestionBankFile } from "./legal-education.service";
import { CreateLegalEducationCampaignDto } from "./dto/create-campaign.dto";
import { UpdateLegalEducationCampaignDto } from "./dto/update-campaign.dto";
import { CreateLegalEducationMaterialDto } from "./dto/create-material.dto";
import { UpdateLegalEducationMaterialDto } from "./dto/update-material.dto";
import { UpdateLegalExamDto } from "./dto/update-exam.dto";
import { CreateLegalExamQuestionDto } from "./dto/create-question.dto";
import { UpdateLegalExamQuestionDto } from "./dto/update-question.dto";
import { BulkDeleteLegalExamQuestionsDto } from "./dto/bulk-delete-questions.dto";

@ApiBearerAuth()
@ApiTags("admin-legal-education")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/legal-education")
export class AdminLegalEducationController {
  constructor(private readonly legalEducation: LegalEducationService) {}

  @RequirePermissions("legaleducation:view")
  @Get("campaigns")
  list(): Promise<LegalEducationCampaignDto[]> {
    return this.legalEducation.listForAdmin();
  }

  @RequirePermissions("legaleducation:view")
  @Get("campaigns/:id")
  findOne(@Param("id") id: string): Promise<LegalEducationCampaignDetailDto> {
    return this.legalEducation.findOneForAdmin(id);
  }

  @RequirePermissions("legaleducation:create")
  @Post("campaigns")
  create(
    @Body() dto: CreateLegalEducationCampaignDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<LegalEducationCampaignDto> {
    return this.legalEducation.createCampaign(dto, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @Patch("campaigns/:id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateLegalEducationCampaignDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<LegalEducationCampaignDto> {
    return this.legalEducation.updateCampaign(id, dto, actor.sub);
  }

  @RequirePermissions("legaleducation:delete")
  @Delete("campaigns/:id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.legalEducation.removeCampaign(id, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @Post("campaigns/:id/materials")
  addMaterial(
    @Param("id") id: string,
    @Body() dto: CreateLegalEducationMaterialDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<LegalEducationMaterialDto> {
    return this.legalEducation.addMaterial(id, dto, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @Patch("campaigns/:id/materials/:materialId")
  updateMaterial(
    @Param("id") id: string,
    @Param("materialId") materialId: string,
    @Body() dto: UpdateLegalEducationMaterialDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<LegalEducationMaterialDto> {
    return this.legalEducation.updateMaterial(id, materialId, dto, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @Delete("campaigns/:id/materials/:materialId")
  removeMaterial(
    @Param("id") id: string,
    @Param("materialId") materialId: string,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<void> {
    return this.legalEducation.removeMaterial(id, materialId, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @Patch("campaigns/:id/exam")
  updateExam(
    @Param("id") id: string,
    @Body() dto: UpdateLegalExamDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<LegalExamSettingsDto> {
    return this.legalEducation.updateExam(id, dto, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @Post("campaigns/:id/exam/questions/bulk-delete")
  removeQuestions(
    @Param("id") id: string,
    @Body() dto: BulkDeleteLegalExamQuestionsDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<void> {
    return this.legalEducation.removeQuestions(id, dto.ids, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"]
    }
  })
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }))
  @Post("campaigns/:id/exam/questions/import")
  importQuestions(
    @Param("id") id: string,
    @UploadedFile() file: UploadedQuestionBankFile | undefined,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<LegalExamQuestionImportResultDto> {
    return this.legalEducation.importQuestions(id, file, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @Post("campaigns/:id/exam/questions")
  addQuestion(
    @Param("id") id: string,
    @Body() dto: CreateLegalExamQuestionDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<LegalExamQuestionDto> {
    return this.legalEducation.addQuestion(id, dto, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @Patch("campaigns/:id/exam/questions/:questionId")
  updateQuestion(
    @Param("id") id: string,
    @Param("questionId") questionId: string,
    @Body() dto: UpdateLegalExamQuestionDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<LegalExamQuestionDto> {
    return this.legalEducation.updateQuestion(id, questionId, dto, actor.sub);
  }

  @RequirePermissions("legaleducation:update")
  @Delete("campaigns/:id/exam/questions/:questionId")
  removeQuestion(
    @Param("id") id: string,
    @Param("questionId") questionId: string,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<void> {
    return this.legalEducation.removeQuestion(id, questionId, actor.sub);
  }

  // Đặt trước :id nếu sau này có route exams/:id — "results.csv" phải khai trước results để khỏi nuốt.
  @RequirePermissions("legaleducation:view")
  @Get("exams/:examId/results.csv")
  async exportResultsCsv(
    @Param("examId") examId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const { fileName, csv } = await this.legalEducation.getResultsCsv(examId);
    const buffer = Buffer.from(csv, "utf8");
    res.set({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`
    });
    return new StreamableFile(buffer);
  }

  @RequirePermissions("legaleducation:view")
  @Get("exams/:examId/results-units.csv")
  async exportUnitResultsCsv(
    @Param("examId") examId: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const { fileName, csv } = await this.legalEducation.getUnitResultsCsv(examId);
    const buffer = Buffer.from(csv, "utf8");
    res.set({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`
    });
    return new StreamableFile(buffer);
  }

  @RequirePermissions("legaleducation:view")
  @Get("exams/:examId/results")
  getResults(@Param("examId") examId: string): Promise<LegalExamResultsDto> {
    return this.legalEducation.getResults(examId);
  }
}
