import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from "class-validator";
import type {
  CreateUnionMemberLoginPasswordMode,
  CreateUnionMemberLoginsRequest
} from "@congdoan/types";

export class CreateUnionMemberLoginsDto implements CreateUnionMemberLoginsRequest {
  @ApiProperty({ enum: ["default", "random"] })
  @IsIn(["default", "random"], { message: "Chọn mật khẩu mặc định (utehy123) hoặc mật khẩu ngẫu nhiên." })
  passwordMode!: CreateUnionMemberLoginPasswordMode;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  staffCodes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allEligible?: boolean;
}
