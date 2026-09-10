import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";
import type { ReplyContactMessageRequest } from "@congdoan/types";

export class ReplyContactMessageDto implements ReplyContactMessageRequest {
  @ApiProperty()
  @IsString()
  @MinLength(3, { message: "Tiêu đề tối thiểu 3 ký tự." })
  @MaxLength(200)
  subject!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5, { message: "Nội dung phản hồi tối thiểu 5 ký tự." })
  @MaxLength(4000)
  body!: string;
}
