import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsEmail, IsString, MinLength } from "class-validator";
import type { CreateUserRequest } from "@congdoan/types";

export class CreateUserDto implements CreateUserRequest {
  @ApiProperty()
  @IsEmail({}, { message: "Email không hợp lệ." })
  email!: string;

  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: "Mật khẩu tối thiểu 8 ký tự." })
  password!: string;

  @ApiProperty({ type: [String] })
  @ArrayNotEmpty({ message: "Phải gán ít nhất một vai trò." })
  @IsString({ each: true })
  roleIds!: string[];
}
