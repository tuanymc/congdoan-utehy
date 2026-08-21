import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString } from "class-validator";
import type { CreateUnionCommitteeMemberRequest } from "@congdoan/types";

export class CreateUnionCommitteeMemberDto implements CreateUnionCommitteeMemberRequest {
  @ApiProperty()
  @IsString()
  termId!: string;

  @ApiProperty()
  @IsString()
  memberId!: string;

  /// Bỏ qua (undefined) = Ban chấp hành cấp trường — xem UnionCommitteeMember.departmentId.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty()
  @IsString()
  positionTitle!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
