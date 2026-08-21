import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, MyUnionMemberDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UnionMembersService } from "./union-members.service";
import { UpdateMyUnionMemberDto } from "./dto/update-my-union-member.dto";

/** Self-service "/cong-doan-vien" — công đoàn viên (đã đăng nhập) tự xem/sửa thông tin cá nhân của
 * chính mình, tra theo UnionMember.userId liên kết. KHÔNG cần permission "unionmember:*" (không phải
 * màn hình quản trị) — chỉ cần đăng nhập, xem đúng bản ghi liên kết với chính tài khoản đó. Đổi mật
 * khẩu dùng lại POST /auth/change-password đã có sẵn (xem AuthController), không lặp lại ở đây. */
@ApiBearerAuth()
@ApiTags("me-union-member")
@UseGuards(JwtAuthGuard)
@Controller("me/union-member")
export class MeUnionMemberController {
  constructor(private readonly unionMembersService: UnionMembersService) {}

  @Get()
  findMine(@CurrentUser() user: JwtAccessPayload): Promise<MyUnionMemberDto> {
    return this.unionMembersService.findMyUnionMember(user.sub);
  }

  @Patch()
  updateMine(@CurrentUser() user: JwtAccessPayload, @Body() dto: UpdateMyUnionMemberDto): Promise<MyUnionMemberDto> {
    return this.unionMembersService.updateMyUnionMember(user.sub, dto);
  }
}
