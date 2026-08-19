import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import type { PostStatus } from "@congdoan/types";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

const POST_STATUSES: PostStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export class QueryPublicPostsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorySlug?: string;
}

export class QueryAdminPostsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ enum: POST_STATUSES })
  @IsOptional()
  @IsEnum(POST_STATUSES)
  status?: PostStatus;
}
