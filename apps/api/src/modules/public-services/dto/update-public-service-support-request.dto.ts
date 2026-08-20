import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, IsUUID } from "class-validator";
import { PUBLIC_SERVICE_SUPPORT_REQUEST_STATUSES } from "@congdoan/types";
import type { PublicServiceSupportRequestStatus, UpdatePublicServiceSupportRequestRequest } from "@congdoan/types";

/** Dùng riêng cho trang quản trị triage yêu cầu hỗ trợ — CHỈ đổi được status/assignedToUserId/staffNote,
 * KHÔNG kế thừa CreatePublicServiceSupportRequestDto (khác PartialType thường dùng ở các module khác)
 * vì đây không phải "sửa lại thông tin người gửi", mà là 1 tập hành động khác hẳn (xem ghi chú type
 * UpdatePublicServiceSupportRequestRequest trong @congdoan/types). */
export class UpdatePublicServiceSupportRequestDto implements UpdatePublicServiceSupportRequestRequest {
  @ApiPropertyOptional({ enum: PUBLIC_SERVICE_SUPPORT_REQUEST_STATUSES })
  @IsOptional()
  @IsIn(PUBLIC_SERVICE_SUPPORT_REQUEST_STATUSES)
  status?: PublicServiceSupportRequestStatus;

  @ApiPropertyOptional({ nullable: true, description: "Id cán bộ được phân công — null để bỏ phân công." })
  @IsOptional()
  @IsUUID()
  assignedToUserId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  staffNote?: string;
}
