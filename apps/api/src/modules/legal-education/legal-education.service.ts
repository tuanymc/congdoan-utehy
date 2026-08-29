import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  LegalEducationCampaignDetailDto,
  LegalEducationCampaignDto,
  LegalEducationMaterialDto,
  LegalExamAttemptDto,
  LegalExamAttemptStatus,
  LegalExamQuestionDto,
  LegalExamResultsDto,
  LegalExamSettingsDto,
  LegalExamSubmitResultDto,
  LegalExamTakerQuestionDto,
  MyLegalExamAttemptListItemDto,
  PublicLegalCampaignDetailDto,
  PublicLegalCampaignListItemDto,
  PublicLegalMaterialDetailDto
} from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { slugify } from "../../common/utils/slugify";
import { CreateLegalEducationCampaignDto } from "./dto/create-campaign.dto";
import { UpdateLegalEducationCampaignDto } from "./dto/update-campaign.dto";
import { CreateLegalEducationMaterialDto } from "./dto/create-material.dto";
import { UpdateLegalEducationMaterialDto } from "./dto/update-material.dto";
import { UpdateLegalExamDto } from "./dto/update-exam.dto";
import { CreateLegalExamQuestionDto } from "./dto/create-question.dto";
import { UpdateLegalExamQuestionDto } from "./dto/update-question.dto";
import { SaveLegalExamAnswersDto } from "./dto/save-answers.dto";

const SUBMIT_GRACE_MS = 60_000;

const campaignAdminInclude = Prisma.validator<Prisma.LegalEducationCampaignDefaultArgs>()({
  include: {
    materials: { orderBy: { sortOrder: "asc" } },
    exam: {
      include: {
        questions: { orderBy: { sortOrder: "asc" } },
        _count: { select: { questions: true } }
      }
    },
    _count: { select: { materials: true } }
  }
});
type CampaignAdmin = Prisma.LegalEducationCampaignGetPayload<typeof campaignAdminInclude>;

function parseOptions(optionsJson: string): string[] {
  try {
    const parsed: unknown = JSON.parse(optionsJson);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function parseStringArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function parseOptionOrder(json: string | null): Record<string, number[]> {
  if (!json) return {};
  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return {};
    const result: Record<string, number[]> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(value) && value.every((n) => typeof n === "number")) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

function toExamSettingsDto(
  exam: NonNullable<CampaignAdmin["exam"]> | {
    id: string;
    campaignId: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    passingScorePercent: number;
    maxAttempts: number;
    revealAnswers: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    isOpen: boolean;
    startAt: Date | null;
    endAt: Date | null;
    _count: { questions: number };
  }
): LegalExamSettingsDto {
  return {
    id: exam.id,
    campaignId: exam.campaignId,
    title: exam.title,
    description: exam.description,
    durationMinutes: exam.durationMinutes,
    passingScorePercent: exam.passingScorePercent,
    maxAttempts: exam.maxAttempts,
    revealAnswers: exam.revealAnswers,
    shuffleQuestions: exam.shuffleQuestions,
    shuffleOptions: exam.shuffleOptions,
    isOpen: exam.isOpen,
    startAt: toIso(exam.startAt),
    endAt: toIso(exam.endAt),
    questionCount: exam._count.questions
  };
}

function toQuestionDto(q: {
  id: string;
  examId: string;
  text: string;
  optionsJson: string;
  correctOptionIndex: number;
  sortOrder: number;
}): LegalExamQuestionDto {
  return {
    id: q.id,
    examId: q.examId,
    text: q.text,
    options: parseOptions(q.optionsJson),
    correctOptionIndex: q.correctOptionIndex,
    sortOrder: q.sortOrder
  };
}

function toMaterialDto(m: CampaignAdmin["materials"][number]): LegalEducationMaterialDto {
  return {
    id: m.id,
    campaignId: m.campaignId,
    slug: m.slug,
    title: m.title,
    excerpt: m.excerpt,
    content: m.content,
    fileUrl: m.fileUrl,
    sortOrder: m.sortOrder,
    isPublished: m.isPublished,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString()
  };
}

function toCampaignDto(c: CampaignAdmin): LegalEducationCampaignDto {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    periodLabel: c.periodLabel,
    startAt: toIso(c.startAt),
    endAt: toIso(c.endAt),
    isPublished: c.isPublished,
    materialCount: c._count.materials,
    exam: c.exam ? toExamSettingsDto(c.exam) : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString()
  };
}

function toCampaignDetailDto(c: CampaignAdmin): LegalEducationCampaignDetailDto {
  return {
    ...toCampaignDto(c),
    materials: c.materials.map(toMaterialDto),
    questions: c.exam ? c.exam.questions.map(toQuestionDto) : []
  };
}

function examWindowOpen(exam: { isOpen: boolean; startAt: Date | null; endAt: Date | null }, now: Date): boolean {
  if (!exam.isOpen) return false;
  if (exam.startAt && now < exam.startAt) return false;
  if (exam.endAt && now > exam.endAt) return false;
  return true;
}

function expiresAt(startedAt: Date, durationMinutes: number): Date {
  return new Date(startedAt.getTime() + durationMinutes * 60_000);
}

@Injectable()
export class LegalEducationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  private async findCampaignOrThrow(id: string): Promise<CampaignAdmin> {
    const campaign = await this.prisma.legalEducationCampaign.findUnique({ where: { id }, ...campaignAdminInclude });
    if (!campaign) throw new NotFoundException("Không tìm thấy đợt phổ biến pháp luật này.");
    return campaign;
  }

  private async uniqueCampaignSlug(base: string, excludeId?: string): Promise<string> {
    const root = slugify(base) || "dot-pho-bien-phap-luat";
    let slug = root;
    let n = 2;
    while (true) {
      const existing = await this.prisma.legalEducationCampaign.findFirst({
        where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }
      });
      if (!existing) return slug;
      slug = `${root}-${n}`;
      n += 1;
    }
  }

  private async uniqueMaterialSlug(campaignId: string, base: string, excludeId?: string): Promise<string> {
    const root = slugify(base) || "tai-lieu";
    let slug = root;
    let n = 2;
    while (true) {
      const existing = await this.prisma.legalEducationMaterial.findFirst({
        where: { campaignId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) }
      });
      if (!existing) return slug;
      slug = `${root}-${n}`;
      n += 1;
    }
  }

  private validateQuestionShape(options: string[], correctOptionIndex: number): void {
    if (options.length < 2) {
      throw new BadRequestException("Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn.");
    }
    if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
      throw new BadRequestException("Đáp án đúng phải khớp một trong các lựa chọn đã nhập.");
    }
  }

  // ---------- Admin: campaign ----------

  async listForAdmin(): Promise<LegalEducationCampaignDto[]> {
    const items = await this.prisma.legalEducationCampaign.findMany({
      ...campaignAdminInclude,
      orderBy: { createdAt: "desc" }
    });
    return items.map(toCampaignDto);
  }

  async findOneForAdmin(id: string): Promise<LegalEducationCampaignDetailDto> {
    return toCampaignDetailDto(await this.findCampaignOrThrow(id));
  }

  async createCampaign(dto: CreateLegalEducationCampaignDto, actorUserId: string): Promise<LegalEducationCampaignDto> {
    const slug = await this.uniqueCampaignSlug(dto.slug || dto.title);
    const campaign = await this.prisma.legalEducationCampaign.create({
      data: {
        slug,
        title: dto.title,
        summary: dto.summary,
        periodLabel: dto.periodLabel,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        isPublished: dto.isPublished ?? false,
        exam: {
          create: {
            title: dto.examTitle?.trim() || `${dto.title} — Trắc nghiệm`,
            description: dto.examDescription,
            durationMinutes: dto.durationMinutes ?? 30,
            passingScorePercent: dto.passingScorePercent ?? 70,
            maxAttempts: dto.maxAttempts ?? 1,
            revealAnswers: dto.revealAnswers ?? false,
            shuffleQuestions: dto.shuffleQuestions ?? true,
            shuffleOptions: dto.shuffleOptions ?? true,
            isOpen: dto.examIsOpen ?? false,
            startAt: dto.examStartAt ? new Date(dto.examStartAt) : undefined,
            endAt: dto.examEndAt ? new Date(dto.examEndAt) : undefined
          }
        }
      },
      ...campaignAdminInclude
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "LegalEducationCampaign", entityId: campaign.id });
    return toCampaignDto(campaign);
  }

  async updateCampaign(
    id: string,
    dto: UpdateLegalEducationCampaignDto,
    actorUserId: string
  ): Promise<LegalEducationCampaignDto> {
    const existing = await this.findCampaignOrThrow(id);
    const slug =
      dto.slug !== undefined || dto.title !== undefined
        ? await this.uniqueCampaignSlug(dto.slug || dto.title || existing.title, id)
        : undefined;

    const examPatch: Prisma.LegalExamUpdateWithoutCampaignInput = {};
    if (dto.examTitle !== undefined) examPatch.title = dto.examTitle;
    if (dto.examDescription !== undefined) examPatch.description = dto.examDescription;
    if (dto.durationMinutes !== undefined) examPatch.durationMinutes = dto.durationMinutes;
    if (dto.passingScorePercent !== undefined) examPatch.passingScorePercent = dto.passingScorePercent;
    if (dto.maxAttempts !== undefined) examPatch.maxAttempts = dto.maxAttempts;
    if (dto.revealAnswers !== undefined) examPatch.revealAnswers = dto.revealAnswers;
    if (dto.shuffleQuestions !== undefined) examPatch.shuffleQuestions = dto.shuffleQuestions;
    if (dto.shuffleOptions !== undefined) examPatch.shuffleOptions = dto.shuffleOptions;
    if (dto.examIsOpen !== undefined) examPatch.isOpen = dto.examIsOpen;
    if (dto.examStartAt !== undefined) examPatch.startAt = dto.examStartAt ? new Date(dto.examStartAt) : null;
    if (dto.examEndAt !== undefined) examPatch.endAt = dto.examEndAt ? new Date(dto.examEndAt) : null;

    const campaign = await this.prisma.legalEducationCampaign.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        summary: dto.summary,
        periodLabel: dto.periodLabel,
        startAt: dto.startAt !== undefined ? (dto.startAt ? new Date(dto.startAt) : null) : undefined,
        endAt: dto.endAt !== undefined ? (dto.endAt ? new Date(dto.endAt) : null) : undefined,
        isPublished: dto.isPublished,
        ...(existing.exam && Object.keys(examPatch).length > 0 ? { exam: { update: examPatch } } : {})
      },
      ...campaignAdminInclude
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "LegalEducationCampaign", entityId: id });
    return toCampaignDto(campaign);
  }

  async removeCampaign(id: string, actorUserId: string): Promise<void> {
    const campaign = await this.findCampaignOrThrow(id);
    if (campaign.exam) {
      await this.prisma.legalExamAttemptAnswer.deleteMany({ where: { question: { examId: campaign.exam.id } } });
    }
    await this.prisma.legalEducationCampaign.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "LegalEducationCampaign", entityId: id });
  }

  // ---------- Admin: materials ----------

  async addMaterial(
    campaignId: string,
    dto: CreateLegalEducationMaterialDto,
    actorUserId: string
  ): Promise<LegalEducationMaterialDto> {
    await this.findCampaignOrThrow(campaignId);
    const slug = await this.uniqueMaterialSlug(campaignId, dto.slug || dto.title);
    const material = await this.prisma.legalEducationMaterial.create({
      data: {
        campaignId,
        slug,
        title: dto.title,
        excerpt: dto.excerpt,
        content: dto.content,
        fileUrl: dto.fileUrl,
        sortOrder: dto.sortOrder ?? 0,
        isPublished: dto.isPublished ?? true
      }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "LegalEducationMaterial", entityId: material.id });
    return toMaterialDto(material);
  }

  private async findMaterialOrThrow(campaignId: string, materialId: string) {
    const material = await this.prisma.legalEducationMaterial.findFirst({ where: { id: materialId, campaignId } });
    if (!material) throw new NotFoundException("Không tìm thấy tài liệu này trong đợt phổ biến.");
    return material;
  }

  async updateMaterial(
    campaignId: string,
    materialId: string,
    dto: UpdateLegalEducationMaterialDto,
    actorUserId: string
  ): Promise<LegalEducationMaterialDto> {
    const existing = await this.findMaterialOrThrow(campaignId, materialId);
    const slug =
      dto.slug !== undefined || dto.title !== undefined
        ? await this.uniqueMaterialSlug(campaignId, dto.slug || dto.title || existing.title, materialId)
        : undefined;
    const material = await this.prisma.legalEducationMaterial.update({
      where: { id: materialId },
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        fileUrl: dto.fileUrl,
        sortOrder: dto.sortOrder,
        isPublished: dto.isPublished
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "LegalEducationMaterial", entityId: materialId });
    return toMaterialDto(material);
  }

  async removeMaterial(campaignId: string, materialId: string, actorUserId: string): Promise<void> {
    await this.findMaterialOrThrow(campaignId, materialId);
    await this.prisma.legalEducationMaterial.delete({ where: { id: materialId } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "LegalEducationMaterial", entityId: materialId });
  }

  // ---------- Admin: exam settings / questions ----------

  async updateExam(campaignId: string, dto: UpdateLegalExamDto, actorUserId: string): Promise<LegalExamSettingsDto> {
    const campaign = await this.findCampaignOrThrow(campaignId);
    if (!campaign.exam) throw new NotFoundException("Đợt này chưa có bài thi.");
    const exam = await this.prisma.legalExam.update({
      where: { id: campaign.exam.id },
      data: {
        title: dto.title,
        description: dto.description,
        durationMinutes: dto.durationMinutes,
        passingScorePercent: dto.passingScorePercent,
        maxAttempts: dto.maxAttempts,
        revealAnswers: dto.revealAnswers,
        shuffleQuestions: dto.shuffleQuestions,
        shuffleOptions: dto.shuffleOptions,
        isOpen: dto.isOpen,
        startAt: dto.startAt !== undefined ? (dto.startAt ? new Date(dto.startAt) : null) : undefined,
        endAt: dto.endAt !== undefined ? (dto.endAt ? new Date(dto.endAt) : null) : undefined
      },
      include: { _count: { select: { questions: true } } }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "LegalExam", entityId: exam.id });
    return toExamSettingsDto(exam);
  }

  async addQuestion(campaignId: string, dto: CreateLegalExamQuestionDto, actorUserId: string): Promise<LegalExamQuestionDto> {
    const campaign = await this.findCampaignOrThrow(campaignId);
    if (!campaign.exam) throw new NotFoundException("Đợt này chưa có bài thi.");
    this.validateQuestionShape(dto.options, dto.correctOptionIndex);
    const question = await this.prisma.legalExamQuestion.create({
      data: {
        examId: campaign.exam.id,
        text: dto.text,
        optionsJson: JSON.stringify(dto.options),
        correctOptionIndex: dto.correctOptionIndex,
        sortOrder: dto.sortOrder ?? 0
      }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "LegalExamQuestion", entityId: question.id });
    return toQuestionDto(question);
  }

  private async findQuestionOrThrow(campaignId: string, questionId: string) {
    const campaign = await this.findCampaignOrThrow(campaignId);
    if (!campaign.exam) throw new NotFoundException("Đợt này chưa có bài thi.");
    const question = await this.prisma.legalExamQuestion.findFirst({
      where: { id: questionId, examId: campaign.exam.id }
    });
    if (!question) throw new NotFoundException("Không tìm thấy câu hỏi này trong bài thi.");
    return question;
  }

  async updateQuestion(
    campaignId: string,
    questionId: string,
    dto: UpdateLegalExamQuestionDto,
    actorUserId: string
  ): Promise<LegalExamQuestionDto> {
    const existing = await this.findQuestionOrThrow(campaignId, questionId);
    const nextOptions = dto.options ?? parseOptions(existing.optionsJson);
    const nextCorrect = dto.correctOptionIndex ?? existing.correctOptionIndex;
    this.validateQuestionShape(nextOptions, nextCorrect);
    const question = await this.prisma.legalExamQuestion.update({
      where: { id: questionId },
      data: {
        text: dto.text,
        optionsJson: dto.options ? JSON.stringify(dto.options) : undefined,
        correctOptionIndex: dto.correctOptionIndex,
        sortOrder: dto.sortOrder
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "LegalExamQuestion", entityId: questionId });
    return toQuestionDto(question);
  }

  async removeQuestion(campaignId: string, questionId: string, actorUserId: string): Promise<void> {
    await this.findQuestionOrThrow(campaignId, questionId);
    await this.prisma.legalExamAttemptAnswer.deleteMany({ where: { questionId } });
    await this.prisma.legalExamQuestion.delete({ where: { id: questionId } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "LegalExamQuestion", entityId: questionId });
  }

  async getResults(examId: string): Promise<LegalExamResultsDto> {
    const exam = await this.prisma.legalExam.findUnique({
      where: { id: examId },
      include: { campaign: { select: { title: true } } }
    });
    if (!exam) throw new NotFoundException("Không tìm thấy bài thi này.");

    const attempts = await this.prisma.legalExamAttempt.findMany({
      where: { examId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            linkedUnionMembers: { select: { legacyCode: true }, take: 1 }
          }
        }
      },
      orderBy: { startedAt: "desc" }
    });

    const rows = attempts.map((a) => ({
      attemptId: a.id,
      userId: a.userId,
      fullName: a.user.fullName,
      email: a.user.email,
      staffCode: a.user.linkedUnionMembers[0]?.legacyCode ?? null,
      status: a.status as LegalExamAttemptStatus,
      startedAt: a.startedAt.toISOString(),
      submittedAt: toIso(a.submittedAt),
      score: a.score,
      total: a.total,
      passed: a.passed
    }));

    const submitted = rows.filter((r) => r.status === "SUBMITTED" || r.status === "EXPIRED");
    return {
      examId: exam.id,
      examTitle: exam.title,
      campaignTitle: exam.campaign.title,
      passingScorePercent: exam.passingScorePercent,
      attemptCount: rows.length,
      submittedCount: submitted.length,
      passedCount: submitted.filter((r) => r.passed).length,
      rows
    };
  }

  async getResultsCsv(examId: string): Promise<{ fileName: string; csv: string }> {
    const results = await this.getResults(examId);
    const header = ["Họ tên", "Email", "Mã cán bộ", "Trạng thái", "Bắt đầu", "Nộp bài", "Điểm", "Tổng câu", "Đạt"];
    const lines = [
      header.join(","),
      ...results.rows.map((r) =>
        [
          csvCell(r.fullName),
          csvCell(r.email),
          csvCell(r.staffCode ?? ""),
          csvCell(statusLabel(r.status)),
          csvCell(r.startedAt),
          csvCell(r.submittedAt ?? ""),
          r.score ?? "",
          r.total ?? "",
          r.passed === null ? "" : r.passed ? "Đạt" : "Không đạt"
        ].join(",")
      )
    ];
    const slug = slugify(results.examTitle) || "ket-qua-thi";
    return { fileName: `${slug}.csv`, csv: `\uFEFF${lines.join("\r\n")}` };
  }

  // ---------- Public ----------

  async listPublicCampaigns(): Promise<PublicLegalCampaignListItemDto[]> {
    const items = await this.prisma.legalEducationCampaign.findMany({
      where: { isPublished: true },
      include: {
        exam: { select: { isOpen: true, startAt: true, endAt: true } },
        materials: { where: { isPublished: true }, select: { id: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    const now = new Date();
    return items.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      periodLabel: c.periodLabel,
      materialCount: c.materials.length,
      examIsOpen: c.exam ? examWindowOpen(c.exam, now) : false
    }));
  }

  async findPublicCampaign(slug: string): Promise<PublicLegalCampaignDetailDto> {
    const campaign = await this.prisma.legalEducationCampaign.findFirst({
      where: { slug, isPublished: true },
      include: {
        materials: { where: { isPublished: true }, orderBy: { sortOrder: "asc" } },
        exam: { include: { _count: { select: { questions: true } } } }
      }
    });
    if (!campaign) throw new NotFoundException("Không tìm thấy đợt phổ biến pháp luật này.");
    const now = new Date();
    return {
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      summary: campaign.summary,
      periodLabel: campaign.periodLabel,
      startAt: toIso(campaign.startAt),
      endAt: toIso(campaign.endAt),
      materials: campaign.materials.map((m) => ({
        id: m.id,
        slug: m.slug,
        title: m.title,
        excerpt: m.excerpt,
        fileUrl: m.fileUrl,
        sortOrder: m.sortOrder
      })),
      exam: campaign.exam
        ? {
            id: campaign.exam.id,
            title: campaign.exam.title,
            description: campaign.exam.description,
            durationMinutes: campaign.exam.durationMinutes,
            passingScorePercent: campaign.exam.passingScorePercent,
            maxAttempts: campaign.exam.maxAttempts,
            isOpen: examWindowOpen(campaign.exam, now),
            questionCount: campaign.exam._count.questions
          }
        : null
    };
  }

  async findPublicMaterial(campaignSlug: string, materialSlug: string): Promise<PublicLegalMaterialDetailDto> {
    const material = await this.prisma.legalEducationMaterial.findFirst({
      where: {
        slug: materialSlug,
        isPublished: true,
        campaign: { slug: campaignSlug, isPublished: true }
      },
      include: { campaign: { select: { slug: true, title: true } } }
    });
    if (!material) throw new NotFoundException("Không tìm thấy tài liệu này.");
    return {
      id: material.id,
      slug: material.slug,
      title: material.title,
      excerpt: material.excerpt,
      content: material.content,
      fileUrl: material.fileUrl,
      campaignSlug: material.campaign.slug,
      campaignTitle: material.campaign.title
    };
  }

  // ---------- Member exam ----------

  private async loadExamForTaker(examId: string) {
    const exam = await this.prisma.legalExam.findUnique({
      where: { id: examId },
      include: {
        campaign: { select: { isPublished: true, slug: true, title: true } },
        questions: { orderBy: { sortOrder: "asc" } }
      }
    });
    if (!exam || !exam.campaign.isPublished) throw new NotFoundException("Không tìm thấy bài thi này.");
    return exam;
  }

  async startOrResumeAttempt(examId: string, userId: string): Promise<LegalExamAttemptDto> {
    const exam = await this.loadExamForTaker(examId);
    const now = new Date();
    if (!examWindowOpen(exam, now)) {
      throw new BadRequestException("Bài thi này chưa mở hoặc đã kết thúc.");
    }
    if (exam.questions.length === 0) {
      throw new BadRequestException("Bài thi chưa có câu hỏi.");
    }

    const existingInProgress = await this.prisma.legalExamAttempt.findFirst({
      where: { examId, userId, status: "IN_PROGRESS" },
      include: { answers: true }
    });
    if (existingInProgress) {
      const expired = now.getTime() > expiresAt(existingInProgress.startedAt, exam.durationMinutes).getTime() + SUBMIT_GRACE_MS;
      if (expired) {
        await this.finalizeAttempt(existingInProgress.id, "EXPIRED");
      } else {
        return this.toAttemptDto(existingInProgress.id);
      }
    }

    const usedCount = await this.prisma.legalExamAttempt.count({ where: { examId, userId } });
    if (usedCount >= exam.maxAttempts) {
      throw new ConflictException("Đồng chí đã hết số lần thi cho phép của đợt này.");
    }

    const questionIds = exam.questions.map((q) => q.id);
    if (exam.shuffleQuestions) shuffleInPlace(questionIds);

    const optionOrder: Record<string, number[]> = {};
    for (const q of exam.questions) {
      const options = parseOptions(q.optionsJson);
      const indices = options.map((_, i) => i);
      if (exam.shuffleOptions) shuffleInPlace(indices);
      optionOrder[q.id] = indices;
    }

    const attempt = await this.prisma.legalExamAttempt.create({
      data: {
        examId,
        userId,
        status: "IN_PROGRESS",
        questionOrderJson: JSON.stringify(questionIds),
        optionOrderJson: JSON.stringify(optionOrder)
      }
    });
    return this.toAttemptDto(attempt.id);
  }

  async saveAnswers(examId: string, attemptId: string, userId: string, dto: SaveLegalExamAnswersDto): Promise<{ ok: true }> {
    const attempt = await this.requireOwnInProgressAttempt(examId, attemptId, userId);
    await this.upsertAnswers(attempt.id, dto);
    return { ok: true };
  }

  async submitAttempt(examId: string, attemptId: string, userId: string, dto?: SaveLegalExamAnswersDto): Promise<LegalExamSubmitResultDto> {
    const attempt = await this.requireOwnInProgressAttempt(examId, attemptId, userId);
    if (dto) await this.upsertAnswers(attempt.id, dto);

    const now = new Date();
    const deadline = expiresAt(attempt.startedAt, attempt.exam.durationMinutes).getTime() + SUBMIT_GRACE_MS;
    const status: LegalExamAttemptStatus = now.getTime() > deadline ? "EXPIRED" : "SUBMITTED";
    return this.finalizeAttempt(attempt.id, status);
  }

  async listMyAttempts(userId: string): Promise<MyLegalExamAttemptListItemDto[]> {
    const attempts = await this.prisma.legalExamAttempt.findMany({
      where: { userId },
      include: {
        exam: { select: { title: true, campaign: { select: { slug: true, title: true } } } }
      },
      orderBy: { startedAt: "desc" }
    });
    return attempts.map((a) => ({
      id: a.id,
      examId: a.examId,
      examTitle: a.exam.title,
      campaignSlug: a.exam.campaign.slug,
      campaignTitle: a.exam.campaign.title,
      status: a.status as LegalExamAttemptStatus,
      startedAt: a.startedAt.toISOString(),
      submittedAt: toIso(a.submittedAt),
      score: a.score,
      total: a.total,
      passed: a.passed
    }));
  }

  private async requireOwnInProgressAttempt(examId: string, attemptId: string, userId: string) {
    const attempt = await this.prisma.legalExamAttempt.findFirst({
      where: { id: attemptId, examId, userId },
      include: { exam: true, answers: true }
    });
    if (!attempt) throw new NotFoundException("Không tìm thấy lượt thi này.");
    if (attempt.userId !== userId) throw new ForbiddenException("Không được thao tác lượt thi của người khác.");
    if (attempt.status !== "IN_PROGRESS") {
      throw new BadRequestException("Lượt thi này đã kết thúc, không thể nộp lại.");
    }
    return attempt;
  }

  private async upsertAnswers(attemptId: string, dto: SaveLegalExamAnswersDto): Promise<void> {
    const attempt = await this.prisma.legalExamAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: { include: { questions: true } } }
    });
    if (!attempt) throw new NotFoundException("Không tìm thấy lượt thi này.");
    const validIds = new Set(attempt.exam.questions.map((q) => q.id));
    const optionCounts = new Map(attempt.exam.questions.map((q) => [q.id, parseOptions(q.optionsJson).length]));

    for (const item of dto.answers) {
      if (!validIds.has(item.questionId)) continue;
      const maxIndex = optionCounts.get(item.questionId) ?? 0;
      const selected =
        item.selectedOptionIndex === null || item.selectedOptionIndex === undefined
          ? null
          : item.selectedOptionIndex;
      if (selected !== null && (selected < 0 || selected >= maxIndex)) {
        throw new BadRequestException("Lựa chọn không hợp lệ.");
      }
      await this.prisma.legalExamAttemptAnswer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: item.questionId } },
        create: { attemptId, questionId: item.questionId, selectedOptionIndex: selected },
        update: { selectedOptionIndex: selected }
      });
    }
  }

  private async finalizeAttempt(attemptId: string, status: LegalExamAttemptStatus): Promise<LegalExamSubmitResultDto> {
    const attempt = await this.prisma.legalExamAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { include: { questions: { orderBy: { sortOrder: "asc" } } } },
        answers: true
      }
    });
    if (!attempt) throw new NotFoundException("Không tìm thấy lượt thi này.");

    const answerByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a.selectedOptionIndex]));
    let score = 0;
    const review: NonNullable<LegalExamSubmitResultDto["review"]> = [];

    for (const q of attempt.exam.questions) {
      const selected = answerByQuestion.get(q.id) ?? null;
      const isCorrect = selected !== null && selected === q.correctOptionIndex;
      if (isCorrect) score += 1;
      await this.prisma.legalExamAttemptAnswer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: q.id } },
        create: { attemptId, questionId: q.id, selectedOptionIndex: selected, isCorrect },
        update: { selectedOptionIndex: selected, isCorrect }
      });
      review.push({
        questionId: q.id,
        text: q.text,
        options: parseOptions(q.optionsJson),
        selectedOptionIndex: selected,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect
      });
    }

    const total = attempt.exam.questions.length;
    const percent = total === 0 ? 0 : (score / total) * 100;
    const passed = percent >= attempt.exam.passingScorePercent;
    const submittedAt = new Date();

    await this.prisma.legalExamAttempt.update({
      where: { id: attemptId },
      data: { status, submittedAt, score, total, passed }
    });

    return {
      id: attemptId,
      status,
      score,
      total,
      passed,
      passingScorePercent: attempt.exam.passingScorePercent,
      submittedAt: submittedAt.toISOString(),
      review: attempt.exam.revealAnswers ? review : undefined
    };
  }

  private async toAttemptDto(attemptId: string): Promise<LegalExamAttemptDto> {
    const attempt = await this.prisma.legalExamAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { include: { questions: true } },
        answers: true
      }
    });
    if (!attempt) throw new NotFoundException("Không tìm thấy lượt thi này.");

    const questionById = new Map(attempt.exam.questions.map((q) => [q.id, q]));
    const order = parseStringArray(attempt.questionOrderJson);
    const orderedIds = order.length > 0 ? order.filter((id) => questionById.has(id)) : attempt.exam.questions.map((q) => q.id);
    const optionOrder = parseOptionOrder(attempt.optionOrderJson);

    const questions: LegalExamTakerQuestionDto[] = orderedIds.map((id) => {
      const q = questionById.get(id)!;
      const options = parseOptions(q.optionsJson);
      const indices = optionOrder[id] ?? options.map((_, i) => i);
      return {
        id: q.id,
        text: q.text,
        options: indices.map((i) => options[i] ?? ""),
        originalIndices: indices
      };
    });

    return {
      id: attempt.id,
      examId: attempt.examId,
      status: attempt.status as LegalExamAttemptStatus,
      startedAt: attempt.startedAt.toISOString(),
      submittedAt: toIso(attempt.submittedAt),
      durationMinutes: attempt.exam.durationMinutes,
      expiresAt: expiresAt(attempt.startedAt, attempt.exam.durationMinutes).toISOString(),
      score: attempt.score,
      total: attempt.total,
      passed: attempt.passed,
      passingScorePercent: attempt.exam.passingScorePercent,
      revealAnswers: attempt.exam.revealAnswers,
      questions,
      answers: attempt.answers.map((a) => ({
        questionId: a.questionId,
        selectedOptionIndex: a.selectedOptionIndex
      }))
    };
  }
}

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function statusLabel(status: LegalExamAttemptStatus): string {
  if (status === "SUBMITTED") return "Đã nộp";
  if (status === "EXPIRED") return "Hết giờ";
  return "Đang làm";
}
