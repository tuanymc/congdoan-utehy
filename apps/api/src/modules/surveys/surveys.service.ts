import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  PublicSurveyDetailDto,
  PublicSurveyListItemDto,
  SurveyDetailDto,
  SurveyDto,
  SurveyQuestionDto,
  SurveyQuestionResultDto,
  SurveyQuestionType,
  SurveyResultsDto
} from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";
import { CreateSurveyQuestionDto } from "./dto/create-survey-question.dto";
import { UpdateSurveyQuestionDto } from "./dto/update-survey-question.dto";
import { SubmitSurveyResponseDto } from "./dto/submit-survey-response.dto";

const surveyWithCount = Prisma.validator<Prisma.SurveyDefaultArgs>()({
  include: { _count: { select: { questions: true, responses: true } } }
});
type SurveyWithCount = Prisma.SurveyGetPayload<typeof surveyWithCount>;

const surveyWithQuestions = Prisma.validator<Prisma.SurveyDefaultArgs>()({
  include: {
    questions: { orderBy: { sortOrder: "asc" } },
    _count: { select: { questions: true, responses: true } }
  }
});
type SurveyWithQuestions = Prisma.SurveyGetPayload<typeof surveyWithQuestions>;

/** Parse an toàn optionsJson lưu trong CSDL — trả null nếu rỗng/không parse được (phòng dữ liệu hỏng
 * thay vì làm sập cả request). */
function parseOptions(optionsJson: string | null): string[] | null {
  if (!optionsJson) return null;
  try {
    const parsed: unknown = JSON.parse(optionsJson);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : null;
  } catch {
    return null;
  }
}

function toQuestionDto(q: {
  id: string;
  surveyId: string;
  text: string;
  type: string;
  optionsJson: string | null;
  sortOrder: number;
  isRequired: boolean;
}): SurveyQuestionDto {
  return {
    id: q.id,
    surveyId: q.surveyId,
    text: q.text,
    type: q.type as SurveyQuestionType,
    options: parseOptions(q.optionsJson),
    sortOrder: q.sortOrder,
    isRequired: q.isRequired
  };
}

function toDto(s: SurveyWithCount): SurveyDto {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    isOpen: s.isOpen,
    isAnonymous: s.isAnonymous,
    startAt: s.startAt ? s.startAt.toISOString() : null,
    endAt: s.endAt ? s.endAt.toISOString() : null,
    questionCount: s._count.questions,
    responseCount: s._count.responses,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString()
  };
}

function toDetailDto(s: SurveyWithQuestions): SurveyDetailDto {
  return { ...toDto(s), questions: s.questions.map(toQuestionDto) };
}

function toPublicListItemDto(s: SurveyWithCount): PublicSurveyListItemDto {
  return { id: s.id, title: s.title, description: s.description, endAt: s.endAt ? s.endAt.toISOString() : null, questionCount: s._count.questions };
}

/**
 * "Khảo sát ý kiến" (Tiện ích số, Phase 4d) — quản trị (survey metadata + câu hỏi) tách khỏi luồng
 * công khai (trả lời/xem kết quả). Theo đúng chính sách Phase 4b: form trả lời KHÔNG bắt buộc đăng
 * nhập, không lưu userId trên SurveyResponse (xem ghi chú model Survey, prisma/schema.prisma).
 */
@Injectable()
export class SurveysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  // ---------- Quản trị: Survey ----------

  async listForAdmin(): Promise<SurveyDto[]> {
    const surveys = await this.prisma.survey.findMany({ ...surveyWithCount, orderBy: { createdAt: "desc" } });
    return surveys.map(toDto);
  }

  async findOne(id: string): Promise<SurveyDetailDto> {
    const survey = await this.prisma.survey.findUnique({ where: { id }, ...surveyWithQuestions });
    if (!survey) throw new NotFoundException("Không tìm thấy khảo sát này.");
    return toDetailDto(survey);
  }

  async create(dto: CreateSurveyDto, actorUserId: string): Promise<SurveyDto> {
    const survey = await this.prisma.survey.create({
      data: {
        title: dto.title,
        description: dto.description,
        isOpen: dto.isOpen ?? true,
        isAnonymous: dto.isAnonymous ?? true,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined
      },
      ...surveyWithCount
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "Survey", entityId: survey.id });
    return toDto(survey);
  }

  async update(id: string, dto: UpdateSurveyDto, actorUserId: string): Promise<SurveyDto> {
    await this.findOne(id);
    const survey = await this.prisma.survey.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        isOpen: dto.isOpen,
        isAnonymous: dto.isAnonymous,
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        endAt: dto.endAt ? new Date(dto.endAt) : undefined
      },
      ...surveyWithCount
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "Survey", entityId: id });
    return toDto(survey);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    // onDelete: Cascade trên Survey->SurveyQuestion và Survey->SurveyResponse->SurveyAnswer (xem
    // schema.prisma) — xoá khảo sát tự xoá luôn câu hỏi + toàn bộ lượt trả lời (mọi SurveyAnswer đều
    // thuộc đúng 1 SurveyResponse nên đã được dọn hết qua đường này), không cần tự xoá children ở đây.
    await this.prisma.survey.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "Survey", entityId: id });
  }

  // ---------- Quản trị: câu hỏi ----------

  private validateQuestionShape(type: SurveyQuestionType, options: string[] | undefined): void {
    if (type === "SINGLE_CHOICE" && (!options || options.length < 2)) {
      throw new BadRequestException("Câu hỏi trắc nghiệm (SINGLE_CHOICE) cần ít nhất 2 lựa chọn.");
    }
  }

  async addQuestion(surveyId: string, dto: CreateSurveyQuestionDto, actorUserId: string): Promise<SurveyQuestionDto> {
    await this.findOne(surveyId);
    this.validateQuestionShape(dto.type, dto.options);

    const question = await this.prisma.surveyQuestion.create({
      data: {
        surveyId,
        text: dto.text,
        type: dto.type,
        optionsJson: dto.type === "SINGLE_CHOICE" ? JSON.stringify(dto.options) : null,
        sortOrder: dto.sortOrder ?? 0,
        isRequired: dto.isRequired ?? true
      }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "SurveyQuestion", entityId: question.id });
    return toQuestionDto(question);
  }

  private async findQuestionOrThrow(surveyId: string, questionId: string) {
    const question = await this.prisma.surveyQuestion.findFirst({ where: { id: questionId, surveyId } });
    if (!question) throw new NotFoundException("Không tìm thấy câu hỏi này trong khảo sát.");
    return question;
  }

  async updateQuestion(
    surveyId: string,
    questionId: string,
    dto: UpdateSurveyQuestionDto,
    actorUserId: string
  ): Promise<SurveyQuestionDto> {
    const existing = await this.findQuestionOrThrow(surveyId, questionId);
    const nextType = dto.type ?? (existing.type as SurveyQuestionType);
    const nextOptions = dto.options ?? (nextType === "SINGLE_CHOICE" ? parseOptions(existing.optionsJson) ?? undefined : undefined);
    this.validateQuestionShape(nextType, nextOptions);

    // optionsJson: SINGLE_CHOICE -> luôn ghi lại theo nextOptions đã tính ở trên; đổi HẲN sang TEXT (dto.type
    // được gửi lên) -> xoá optionsJson cũ; không đổi type (dto.type undefined, nghĩa là đã là TEXT từ
    // trước) -> undefined = không đụng vào field này trong lần update.
    let nextOptionsJson: string | null | undefined;
    if (nextType === "SINGLE_CHOICE") {
      nextOptionsJson = JSON.stringify(nextOptions);
    } else if (dto.type !== undefined) {
      nextOptionsJson = null;
    } else {
      nextOptionsJson = undefined;
    }

    const question = await this.prisma.surveyQuestion.update({
      where: { id: questionId },
      data: {
        text: dto.text,
        type: dto.type,
        optionsJson: nextOptionsJson,
        sortOrder: dto.sortOrder,
        isRequired: dto.isRequired
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "SurveyQuestion", entityId: questionId });
    return toQuestionDto(question);
  }

  async removeQuestion(surveyId: string, questionId: string, actorUserId: string): Promise<void> {
    await this.findQuestionOrThrow(surveyId, questionId);
    // SurveyAnswer.question là onDelete: NoAction (KHÔNG cascade — xem ghi chú field đó trong
    // schema.prisma, lý do là tránh 2 đường cascade cùng hội tụ về SurveyAnswer mà SQL Server không
    // cho phép) nên phải TỰ xoá các câu trả lời của câu hỏi này trước, nếu không lệnh xoá bên dưới sẽ
    // vướng lỗi ràng buộc khoá ngoại (FK constraint) khi câu hỏi đã có người trả lời.
    await this.prisma.surveyAnswer.deleteMany({ where: { questionId } });
    await this.prisma.surveyQuestion.delete({ where: { id: questionId } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "SurveyQuestion", entityId: questionId });
  }

  // ---------- Quản trị: kết quả ----------

  async getResults(surveyId: string): Promise<SurveyResultsDto> {
    const survey = await this.findOne(surveyId);
    const answers = await this.prisma.surveyAnswer.findMany({
      where: { question: { surveyId } },
      select: { questionId: true, value: true }
    });

    const answersByQuestion = new Map<string, string[]>();
    for (const a of answers) {
      const list = answersByQuestion.get(a.questionId) ?? [];
      list.push(a.value);
      answersByQuestion.set(a.questionId, list);
    }

    const questions: SurveyQuestionResultDto[] = survey.questions.map((q) => {
      const values = answersByQuestion.get(q.id) ?? [];
      if (q.type === "SINGLE_CHOICE") {
        const counts = new Map<string, number>((q.options ?? []).map((opt) => [opt, 0]));
        for (const v of values) {
          counts.set(v, (counts.get(v) ?? 0) + 1);
        }
        return {
          questionId: q.id,
          text: q.text,
          type: q.type,
          optionCounts: Array.from(counts.entries()).map(([option, count]) => ({ option, count }))
        };
      }
      return { questionId: q.id, text: q.text, type: q.type, textAnswers: values };
    });

    return { surveyId: survey.id, title: survey.title, responseCount: survey.responseCount, questions };
  }

  // ---------- Công khai ----------

  /** Công khai — CHỈ khảo sát isOpen=true, sắp theo mới tạo trước. */
  async listPublic(): Promise<PublicSurveyListItemDto[]> {
    const surveys = await this.prisma.survey.findMany({
      where: { isOpen: true },
      ...surveyWithCount,
      orderBy: { createdAt: "desc" }
    });
    return surveys.map(toPublicListItemDto);
  }

  async findOnePublic(id: string): Promise<PublicSurveyDetailDto> {
    const survey = await this.prisma.survey.findFirst({ where: { id, isOpen: true }, ...surveyWithQuestions });
    if (!survey) throw new NotFoundException("Không tìm thấy khảo sát này.");
    return {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      endAt: survey.endAt ? survey.endAt.toISOString() : null,
      questions: survey.questions.map(toQuestionDto)
    };
  }

  /** Gửi 1 lượt trả lời — công khai, không yêu cầu đăng nhập (xem ghi chú model Survey). Kiểm tra:
   * khảo sát đang mở + chưa hết hạn, mọi câu hỏi bắt buộc (isRequired) đều có câu trả lời, và câu trả
   * lời SINGLE_CHOICE phải khớp đúng 1 trong các lựa chọn đã định nghĩa (chặn dữ liệu rác/giả mạo). */
  async submitResponse(surveyId: string, dto: SubmitSurveyResponseDto): Promise<void> {
    const survey = await this.prisma.survey.findFirst({ where: { id: surveyId, isOpen: true }, ...surveyWithQuestions });
    if (!survey) throw new NotFoundException("Không tìm thấy khảo sát này.");
    if (survey.endAt && new Date() > survey.endAt) {
      throw new BadRequestException("Khảo sát này đã hết hạn.");
    }

    const answerByQuestionId = new Map(dto.answers.map((a) => [a.questionId, a.value]));

    for (const question of survey.questions) {
      const value = answerByQuestionId.get(question.id);
      if (question.isRequired && (value === undefined || value.trim() === "")) {
        throw new BadRequestException(`Câu hỏi "${question.text}" là bắt buộc, chưa được trả lời.`);
      }
      if (value !== undefined && question.type === "SINGLE_CHOICE") {
        const options = parseOptions(question.optionsJson) ?? [];
        if (!options.includes(value)) {
          throw new BadRequestException(`Câu trả lời cho "${question.text}" không khớp lựa chọn hợp lệ.`);
        }
      }
    }

    // Bỏ qua câu trả lời cho questionId lạ (không thuộc khảo sát này) — chỉ ghi nhận câu hỏi có thật,
    // tránh dữ liệu rác nếu client gửi kèm id không hợp lệ.
    const validQuestionIds = new Set(survey.questions.map((q) => q.id));
    const answersToCreate = dto.answers.filter((a) => validQuestionIds.has(a.questionId) && a.value.trim() !== "");

    await this.prisma.surveyResponse.create({
      data: {
        surveyId,
        answers: { create: answersToCreate.map((a) => ({ questionId: a.questionId, value: a.value })) }
      }
    });
  }
}
