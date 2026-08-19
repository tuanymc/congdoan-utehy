import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";
import type { ChangePasswordRequest } from "@congdoan/types";

export class ChangePasswordDto implements ChangePasswordRequest {
  @ApiProperty()
  @IsString()
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: "Mật khẩu mới tối thiểu 8 ký tự." })
  newPassword!: string;
}
