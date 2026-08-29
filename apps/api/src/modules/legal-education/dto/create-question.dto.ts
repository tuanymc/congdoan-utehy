import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";
import type { CreateLegalExamQuestionRequest } from "@congdoan/types";

export class CreateLegalExamQuestionDto implements CreateLegalExamQuestionRequest {
  @ApiProperty()
  @IsString()
  text!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(2, { message: "Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn." })
  @IsString({ each: true })
  options!: string[];

  @ApiProperty()
  @IsInt()
  @Min(0)
  correctOptionIndex!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
