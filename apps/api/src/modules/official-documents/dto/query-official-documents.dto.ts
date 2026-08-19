import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsUUID } from "class-validator";
import type { DocumentDirection, DocumentStatus } from "@congdoan/types";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

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

export class QueryOfficialDocumentsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  documentTypeId?: string;

  @ApiPropertyOptional({ enum: DOCUMENT_DIRECTIONS })
  @IsOptional()
  @IsEnum(DOCUMENT_DIRECTIONS)
  direction?: DocumentDirection;

  @ApiPropertyOptional({ enum: DOCUMENT_STATUSES })
  @IsOptional()
  @IsEnum(DOCUMENT_STATUSES)
  status?: DocumentStatus;
}
