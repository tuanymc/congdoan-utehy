import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import type { ReviewUnionMemberProfileChangeRequest } from "@congdoan/types";

export class ReviewProfileChangeDto implements ReviewUnionMemberProfileChangeRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
