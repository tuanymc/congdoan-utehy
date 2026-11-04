import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class StartLegalExamAttemptDto {
  @ApiPropertyOptional({ description: "Mã dự thi đã gửi vào email. Bắt buộc với bài thi chính thức khi requireEntryCode." })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  entryCode?: string;
}
