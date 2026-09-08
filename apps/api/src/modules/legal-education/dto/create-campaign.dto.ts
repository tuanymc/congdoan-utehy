import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import type { CreateLegalEducationCampaignRequest } from "@congdoan/types";

export class CreateLegalEducationCampaignDto implements CreateLegalEducationCampaignRequest {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  periodLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  examTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  examDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScorePercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  revealAnswers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shuffleOptions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  examIsOpen?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  examStartAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  examEndAt?: string;

  @ApiPropertyOptional({ description: "Số câu lấy ngẫu nhiên từ ngân hàng. Bỏ trống = dùng hết ngân hàng." })
  @IsOptional()
  @IsInt()
  @Min(1)
  questionsPerAttempt?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  practiceStartAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  practiceEndAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  practiceMaxAttempts?: number;
}
