import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsUUID } from "class-validator";
import type { DocumentDirection } from "@congdoan/types";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

const DOCUMENT_DIRECTIONS: DocumentDirection[] = ["DRAFT", "OUTGOING", "INCOMING"];

/** Không có filter `status` như bản quản trị — trạng thái xử lý nội bộ không hiển thị công khai (xem
 * PublicOfficialDocumentListItemDto trong packages/types/src/official-document.ts). */
export class QueryPublicOfficialDocumentsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  documentTypeId?: string;

  @ApiPropertyOptional({ enum: DOCUMENT_DIRECTIONS })
  @IsOptional()
  @IsEnum(DOCUMENT_DIRECTIONS)
  direction?: DocumentDirection;
}
