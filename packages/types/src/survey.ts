/** "Khảo sát ý kiến" (Tiện ích số, Phase 4d) — MVP chỉ 2 loại câu hỏi. Xem Survey/SurveyQuestion/
 * SurveyResponse/SurveyAnswer trong prisma/schema.prisma. Không đặt tên interface trùng "Survey" hay
 * "Response" để tránh nhầm với các khái niệm khác — dùng hậu tố Dto/Request nhất quán toàn dự án. */
export type SurveyQuestionType = "SINGLE_CHOICE" | "TEXT";

export interface SurveyQuestionDto {
  id: string;
  surveyId: string;
  text: string;
  type: SurveyQuestionType;
  /** Chỉ có giá trị khi type="SINGLE_CHOICE" — đã parse sẵn từ optionsJson lưu trong CSDL. */
  options: string[] | null;
  sortOrder: number;
  isRequired: boolean;
}

export interface CreateSurveyQuestionRequest {
  text: string;
  type: SurveyQuestionType;
  options?: string[];
  sortOrder?: number;
  isRequired?: boolean;
}

export interface UpdateSurveyQuestionRequest extends Partial<CreateSurveyQuestionRequest> {}

export interface SurveyDto {
  id: string;
  title: string;
  description: string | null;
  isOpen: boolean;
  isAnonymous: boolean;
  startAt: string | null;
  endAt: string | null;
  questionCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyDetailDto extends SurveyDto {
  questions: SurveyQuestionDto[];
}

export interface CreateSurveyRequest {
  title: string;
  description?: string;
  isOpen?: boolean;
  isAnonymous?: boolean;
  startAt?: string;
  endAt?: string;
}

export interface UpdateSurveyRequest extends Partial<CreateSurveyRequest> {}

/** Danh sách khảo sát công khai — chỉ isOpen=true (xem SurveysService.listPublic). */
export interface PublicSurveyListItemDto {
  id: string;
  title: string;
  description: string | null;
  endAt: string | null;
  questionCount: number;
}

/** Chi tiết 1 khảo sát công khai kèm câu hỏi để dựng form trả lời. */
export interface PublicSurveyDetailDto {
  id: string;
  title: string;
  description: string | null;
  endAt: string | null;
  questions: SurveyQuestionDto[];
}

export interface SubmitSurveyAnswerRequest {
  questionId: string;
  /** Câu trả lời tự luận, hoặc đúng 1 giá trị lựa chọn (khớp 1 phần tử trong SurveyQuestionDto.options). */
  value: string;
}

export interface SubmitSurveyResponseRequest {
  answers: SubmitSurveyAnswerRequest[];
}

/** Body JSON khi gửi khảo sát thành công — luôn trả object (không 204/201 rỗng) để IIS ARR và
 * apiFetch không hiểu nhầm là lỗi. */
export interface SubmitSurveyResponseResultDto {
  ok: true;
}

/** Kết quả tổng hợp 1 câu hỏi — optionCounts có giá trị khi type="SINGLE_CHOICE", textAnswers khi
 * type="TEXT" (chỉ 1 trong 2 field có dữ liệu tuỳ loại câu hỏi). */
export interface SurveyQuestionResultDto {
  questionId: string;
  text: string;
  type: SurveyQuestionType;
  optionCounts?: { option: string; count: number }[];
  textAnswers?: string[];
}

export interface SurveyResultsDto {
  surveyId: string;
  title: string;
  responseCount: number;
  questions: SurveyQuestionResultDto[];
}
