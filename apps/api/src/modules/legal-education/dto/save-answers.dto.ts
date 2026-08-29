import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsString, Min, ValidateIf, ValidateNested } from "class-validator";
import type { SaveLegalExamAnswersRequest } from "@congdoan/types";

export class SaveLegalExamAnswerItemDto {
  @ApiProperty()
  @IsString()
  questionId!: string;

  @ApiProperty({ nullable: true })
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  selectedOptionIndex!: number | null;
}

export class SaveLegalExamAnswersDto implements SaveLegalExamAnswersRequest {
  @ApiProperty({ type: [SaveLegalExamAnswerItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveLegalExamAnswerItemDto)
  answers!: SaveLegalExamAnswerItemDto[];
}
