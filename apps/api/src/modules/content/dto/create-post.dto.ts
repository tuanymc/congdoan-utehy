import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID, Matches } from "class-validator";
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

  /** URL tuyệt đối (https://...) hoặc đường dẫn root-relative từ upload (/upload/images/...). */
  @ApiPropertyOptional({ example: "/upload/images/admin-uploads/xxx.jpg" })
  @IsOptional()
  @IsString()
  @Matches(/^(https?:\/\/|\/)/i, {
    message: "coverImageUrl phải là URL (https://...) hoặc đường dẫn bắt đầu bằng / (vd /upload/images/...)"
  })
  coverImageUrl?: string;

  @ApiPropertyOptional({ enum: POST_STATUSES })
  @IsOptional()
  @IsEnum(POST_STATUSES)
  status?: PostStatus;
}
