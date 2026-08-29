/** "Phổ biến pháp luật" + thi trắc nghiệm (Tiện ích số). Đọc tài liệu công khai; thi bắt buộc JWT,
 * lưu kết quả từng user. Không tái dùng Survey (khảo sát ẩn danh, không điểm). */

export const LEGAL_EDUCATION_PATH = "/tien-ich-so-cong-doan/pho-bien-phap-luat";

export type LegalExamAttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";

export interface LegalEducationMaterialDto {
  id: string;
  campaignId: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  fileUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalEducationMaterialListItemDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  fileUrl: string | null;
  sortOrder: number;
}

export interface CreateLegalEducationMaterialRequest {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  fileUrl?: string;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface UpdateLegalEducationMaterialRequest extends Partial<CreateLegalEducationMaterialRequest> {}

export interface LegalExamSettingsDto {
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
  startAt: string | null;
  endAt: string | null;
  questionCount: number;
}

export interface UpdateLegalExamRequest {
  title?: string;
  description?: string;
  durationMinutes?: number;
  passingScorePercent?: number;
  maxAttempts?: number;
  revealAnswers?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  isOpen?: boolean;
  startAt?: string;
  endAt?: string;
}

export interface LegalExamQuestionDto {
  id: string;
  examId: string;
  text: string;
  options: string[];
  /** Chỉ có trên DTO quản trị — không bao giờ gửi cho đoàn viên khi đang làm bài. */
  correctOptionIndex: number;
  sortOrder: number;
}

export interface CreateLegalExamQuestionRequest {
  text: string;
  options: string[];
  correctOptionIndex: number;
  sortOrder?: number;
}

export interface UpdateLegalExamQuestionRequest extends Partial<CreateLegalExamQuestionRequest> {}

export interface LegalEducationCampaignDto {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  periodLabel: string | null;
  startAt: string | null;
  endAt: string | null;
  isPublished: boolean;
  materialCount: number;
  exam: LegalExamSettingsDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface LegalEducationCampaignDetailDto extends LegalEducationCampaignDto {
  materials: LegalEducationMaterialDto[];
  questions: LegalExamQuestionDto[];
}

export interface CreateLegalEducationCampaignRequest {
  title: string;
  slug?: string;
  summary?: string;
  periodLabel?: string;
  startAt?: string;
  endAt?: string;
  isPublished?: boolean;
  examTitle?: string;
  examDescription?: string;
  durationMinutes?: number;
  passingScorePercent?: number;
  maxAttempts?: number;
  revealAnswers?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  examIsOpen?: boolean;
  examStartAt?: string;
  examEndAt?: string;
}

export interface UpdateLegalEducationCampaignRequest extends Partial<CreateLegalEducationCampaignRequest> {}

/** Danh sách đợt công khai — chỉ isPublished=true. */
export interface PublicLegalCampaignListItemDto {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  periodLabel: string | null;
  materialCount: number;
  examIsOpen: boolean;
}

/** Chi tiết đợt công khai: tài liệu + metadata bài thi (KHÔNG câu hỏi). */
export interface PublicLegalCampaignDetailDto {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  periodLabel: string | null;
  startAt: string | null;
  endAt: string | null;
  materials: LegalEducationMaterialListItemDto[];
  exam: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    passingScorePercent: number;
    maxAttempts: number;
    isOpen: boolean;
    questionCount: number;
  } | null;
}

export interface PublicLegalMaterialDetailDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  fileUrl: string | null;
  campaignSlug: string;
  campaignTitle: string;
}

/** Câu hỏi gửi cho đoàn viên khi làm bài — không có correctOptionIndex. */
export interface LegalExamTakerQuestionDto {
  id: string;
  text: string;
  /** Lựa chọn đã xáo (nếu shuffleOptions), đúng thứ tự hiển thị. */
  options: string[];
  /** originalIndex tương ứng từng phần tử options — client gửi lại khi lưu/nộp. */
  originalIndices: number[];
}

export interface LegalExamAttemptAnswerDto {
  questionId: string;
  selectedOptionIndex: number | null;
}

export interface LegalExamAttemptDto {
  id: string;
  examId: string;
  status: LegalExamAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  durationMinutes: number;
  /** startedAt + durationMinutes — client dùng countdown; server vẫn chấm theo mốc này + 60s grace. */
  expiresAt: string;
  score: number | null;
  total: number | null;
  passed: boolean | null;
  passingScorePercent: number;
  revealAnswers: boolean;
  questions: LegalExamTakerQuestionDto[];
  answers: LegalExamAttemptAnswerDto[];
}

export interface SaveLegalExamAnswersRequest {
  answers: { questionId: string; selectedOptionIndex: number | null }[];
}

export interface LegalExamSubmitResultDto {
  id: string;
  status: LegalExamAttemptStatus;
  score: number;
  total: number;
  passed: boolean;
  passingScorePercent: number;
  submittedAt: string;
  /** Chỉ có khi exam.revealAnswers=true. */
  review?: {
    questionId: string;
    text: string;
    options: string[];
    selectedOptionIndex: number | null;
    correctOptionIndex: number;
    isCorrect: boolean;
  }[];
}

export interface MyLegalExamAttemptListItemDto {
  id: string;
  examId: string;
  examTitle: string;
  campaignSlug: string;
  campaignTitle: string;
  status: LegalExamAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  total: number | null;
  passed: boolean | null;
}

export interface LegalExamResultRowDto {
  attemptId: string;
  userId: string;
  fullName: string;
  email: string;
  staffCode: string | null;
  status: LegalExamAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  total: number | null;
  passed: boolean | null;
}

export interface LegalExamResultsDto {
  examId: string;
  examTitle: string;
  campaignTitle: string;
  passingScorePercent: number;
  attemptCount: number;
  submittedCount: number;
  passedCount: number;
  rows: LegalExamResultRowDto[];
}
