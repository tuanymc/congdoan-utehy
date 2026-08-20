import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUUID } from "class-validator";
import type { CreatePublicServiceSupportRequestRequest } from "@congdoan/types";

/** fullName bắt buộc; PHẢI có ít nhất 1 trong 2 (phone/email) — validate ở tầng service
 * (PublicServiceSupportRequestsService.submit), không dùng decorator tổ hợp phức tạp ở đây, giữ đơn
 * giản như quy ước chung của dự án. */
export class CreatePublicServiceSupportRequestDto implements CreatePublicServiceSupportRequestRequest {
  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "Id thủ tục đã chọn trong danh mục Tra cứu nhanh (nếu có)." })
  @IsOptional()
  @IsUUID()
  procedureId?: string;

  @ApiPropertyOptional({ description: "Tên thủ tục tự nhập nếu không chọn được từ danh mục có sẵn." })
  @IsOptional()
  @IsString()
  procedureOther?: string;

  @ApiPropertyOptional({ description: '"Tôi đang vướng ở bước nào?"' })
  @IsOptional()
  @IsString()
  stuckStep?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
