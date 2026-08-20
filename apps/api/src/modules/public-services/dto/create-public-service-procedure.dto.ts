import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches } from "class-validator";
import { PUBLIC_SERVICE_PROCEDURE_CATEGORIES } from "@congdoan/types";
import type { CreatePublicServiceProcedureRequest, PublicServiceProcedureCategory } from "@congdoan/types";

export class CreatePublicServiceProcedureDto implements CreatePublicServiceProcedureRequest {
  @ApiProperty({ description: 'Dùng cho URL trang chi tiết công khai, vd "cap-doi-the-can-cuoc".' })
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: "Slug chỉ gồm chữ thường, số và dấu gạch ngang." })
  slug!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ enum: PUBLIC_SERVICE_PROCEDURE_CATEGORIES })
  @IsIn(PUBLIC_SERVICE_PROCEDURE_CATEGORIES)
  category!: PublicServiceProcedureCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: "1. Điều kiện" })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiPropertyOptional({ description: "2. Hồ sơ cần chuẩn bị" })
  @IsOptional()
  @IsString()
  requiredDocuments?: string;

  @ApiPropertyOptional({ description: "3. Nơi thực hiện" })
  @IsOptional()
  @IsString()
  whereToApply?: string;

  @ApiPropertyOptional({ description: "4. Các bước thao tác" })
  @IsOptional()
  @IsString()
  steps?: string;

  @ApiPropertyOptional({ description: "5. Phí/lệ phí" })
  @IsOptional()
  @IsString()
  fee?: string;

  @ApiPropertyOptional({ description: "6. Thời hạn" })
  @IsOptional()
  @IsString()
  processingTime?: string;

  @ApiPropertyOptional({ description: "7. Cách nhận kết quả" })
  @IsOptional()
  @IsString()
  resultDelivery?: string;

  @ApiPropertyOptional({ description: "8. Lỗi thường gặp" })
  @IsOptional()
  @IsString()
  commonMistakes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: "Mặc định false (nháp) — chỉ bật khi cán bộ Công đoàn đã rà soát nội dung." })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
