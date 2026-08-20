import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString } from "class-validator";
import type { CreateSurveyQuestionRequest, SurveyQuestionType } from "@congdoan/types";

/** MVP chỉ 2 loại — khớp SurveyQuestionType trong @congdoan/types và field `type` (String) trong
 * SurveyQuestion (xem ghi chú convention ở model đó, prisma/schema.prisma). */
const QUESTION_TYPES: SurveyQuestionType[] = ["SINGLE_CHOICE", "TEXT"];

export class CreateSurveyQuestionDto implements CreateSurveyQuestionRequest {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty({ enum: QUESTION_TYPES })
  @IsIn(QUESTION_TYPES)
  type!: SurveyQuestionType;

  // Validate ở tầng service (không dùng @ValidateIf ở đây) rằng options bắt buộc khi
  // type="SINGLE_CHOICE" — @IsOptional() + @ArrayMinSize(2) chỉ đảm bảo NẾU có gửi thì phải có ít
  // nhất 2 lựa chọn (1 lựa chọn thì không còn là "chọn 1 trong nhiều" nữa).
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2, { message: "Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn." })
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
