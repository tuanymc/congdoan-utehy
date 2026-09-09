import { ApiProperty } from "@nestjs/swagger";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from "class-validator";
import type { BulkDeleteLegalExamQuestionsRequest } from "@congdoan/types";

export class BulkDeleteLegalExamQuestionsDto implements BulkDeleteLegalExamQuestionsRequest {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1, { message: "Chưa chọn câu hỏi nào." })
  @ArrayMaxSize(500)
  @IsUUID(undefined, { each: true })
  ids!: string[];
}
