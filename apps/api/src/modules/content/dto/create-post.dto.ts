import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";
import type { CreatePostRequest, PostStatus } from "@congdoan/types";

const POST_STATUSES: PostStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export class CreatePostDto implements CreatePostRequest {
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
  excerpt?: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  coverImageUrl?: string;

  @ApiPropertyOptional({ enum: POST_STATUSES })
  @IsOptional()
  @IsEnum(POST_STATUSES)
  status?: PostStatus;
}
