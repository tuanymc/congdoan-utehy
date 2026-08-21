import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";
import type { LoginRequest } from "@congdoan/types";

export class LoginDto implements LoginRequest {
  @ApiProperty({ example: "admin@congdoan.utehy.edu.vn", description: "Email hoặc mã cán bộ" })
  @IsString({ message: "Email hoặc mã cán bộ không được để trống." })
  @MinLength(1, { message: "Email hoặc mã cán bộ không được để trống." })
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: "Mật khẩu tối thiểu 6 ký tự." })
  password!: string;
}
