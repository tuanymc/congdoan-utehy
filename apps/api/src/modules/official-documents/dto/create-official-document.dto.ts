import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID, Matches } from "class-validator";
import type { CreateOfficialDocumentRequest, DocumentDirection, DocumentStatus } from "@congdoan/types";

const DOCUMENT_DIRECTIONS: DocumentDirection[] = ["DRAFT", "OUTGOING", "INCOMING"];
const DOCUMENT_STATUSES: DocumentStatus[] = [
  "SAVE_DRAFT",
  "SEND_DRAFT",
  "WAIT_PUBLISH",
  "PUBLISHED",
  "PROCESSED",
  "PROCESSING",
  "SEND_AGAIN"
];

export class CreateOfficialDocumentDto implements CreateOfficialDocumentRequest {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ enum: DOCUMENT_DIRECTIONS })
  @IsOptional()
  @IsEnum(DOCUMENT_DIRECTIONS)
  direction?: DocumentDirection;

  @ApiPropertyOptional({ enum: DOCUMENT_STATUSES })
  @IsOptional()
  @IsEnum(DOCUMENT_STATUSES)
  status?: DocumentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: "/upload/images/admin-uploads/xxx.jpg" })
  @IsOptional()
  @IsString()
  @Matches(/^(https?:\/\/|\/)/i, {
    message: "coverImageUrl phải là URL (https://...) hoặc đường dẫn bắt đầu bằng / (vd /upload/images/...)"
  })
  coverImageUrl?: string;

  @ApiProperty()
  @IsUUID()
  documentTypeId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuingOfficeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  receivedAt?: string;
}
