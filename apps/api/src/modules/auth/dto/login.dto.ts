import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";
import type { LoginRequest } from "@congdoan/types";

export class LoginDto implements LoginRequest {
  @ApiProperty({ example: "admin@congdoan.utehy.edu.vn" })
  @IsEmail({}, { message: "Email không hợp lệ." })
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: "Mật khẩu tối thiểu 6 ký tự." })
  password!: string;
}
