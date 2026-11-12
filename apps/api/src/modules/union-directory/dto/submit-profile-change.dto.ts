import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches, ValidateIf } from "class-validator";
import type { SubmitUnionMemberProfileChangeRequest } from "@congdoan/types";

export class SubmitProfileChangeDto implements SubmitUnionMemberProfileChangeRequest {
  @ApiPropertyOptional({ example: "/upload/images/member-uploads/xxx.jpg" })
  @IsOptional()
  @ValidateIf((_, value) => typeof value === "string" && value.trim() !== "")
  @IsString()
  @Matches(/^(https?:\/\/|\/)/i, {
    message: "Ảnh phải là URL (https://...) hoặc đường dẫn bắt đầu bằng / (vd /upload/images/...)"
  })
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  positionTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  degreeLabel?: string;
}
