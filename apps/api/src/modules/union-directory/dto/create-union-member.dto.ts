import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from "class-validator";
import type { CreateUnionMemberRequest } from "@congdoan/types";
import { UpsertUnionMemberProfileDto } from "./upsert-union-member-profile.dto";

export class CreateUnionMemberDto implements CreateUnionMemberRequest {
  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  degreeLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  positionTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  // Không dùng @IsEmail() bắt buộc đúng định dạng — dữ liệu ETL từ web cũ (cột EMAIL kiểu ntext tự
  // do) có thể không đúng chuẩn email 100%, ép validate sẽ chặn nhầm khi admin sửa các field khác của
  // đúng bản ghi đó. Vẫn dùng IsEmail() nhưng optional + cho phép rỗng qua IsOptional.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  /// Có gửi kèm object này thì mới upsert hồ sơ nội bộ (~90 cột gốc NHANVIEN) — bỏ qua (undefined) nếu
  /// không muốn đụng tới hồ sơ, xem UnionMembersService.upsertProfileData.
  @ApiPropertyOptional({ type: UpsertUnionMemberProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertUnionMemberProfileDto)
  profile?: UpsertUnionMemberProfileDto;

  /// Email tài khoản đăng nhập (User) để liên kết cho công đoàn viên tự sửa thông tin ở
  /// "/cong-doan-vien" — gửi "" để gỡ liên kết hiện có, bỏ qua (undefined) để không đụng tới. Không
  /// dùng danh sách /users (ADMIN-only) vì UNION_CLERK cũng cần thao tác màn hình này — admin gõ thẳng
  /// email, service tự tra cứu User tương ứng.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedUserEmail?: string;
}
