import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsString, ValidateNested } from "class-validator";
import type { SubmitSurveyAnswerRequest, SubmitSurveyResponseRequest } from "@congdoan/types";

export class SubmitSurveyAnswerDto implements SubmitSurveyAnswerRequest {
  @ApiProperty()
  @IsString()
  questionId!: string;

  @ApiProperty()
  @IsString()
  value!: string;
}

export class SubmitSurveyResponseDto implements SubmitSurveyResponseRequest {
  @ApiProperty({ type: [SubmitSurveyAnswerDto] })
  @IsArray()
  @ArrayMinSize(1, { message: "Cần trả lời ít nhất 1 câu hỏi." })
  @ValidateNested({ each: true })
  @Type(() => SubmitSurveyAnswerDto)
  answers!: SubmitSurveyAnswerDto[];
}
