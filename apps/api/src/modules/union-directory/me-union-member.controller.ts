import { Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, MyUnionMemberDto, UploadImageResponseDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UnionMembersService } from "./union-members.service";
import { UnionMemberProfileChangeRequestsService } from "./union-member-profile-change-requests.service";
import { UpdateMyUnionMemberDto } from "./dto/update-my-union-member.dto";
import { SubmitProfileChangeDto } from "./dto/submit-profile-change.dto";
import { UploadsService, type UploadedImageFile } from "../uploads/uploads.service";

/** Self-service "/cong-doan-vien" — công đoàn viên (đã đăng nhập) tự xem/sửa thông tin cá nhân của
 * chính mình, tra theo UnionMember.userId liên kết. KHÔNG cần permission "unionmember:*" (không phải
 * màn hình quản trị) — chỉ cần đăng nhập, xem đúng bản ghi liên kết với chính tài khoản đó. Đổi mật
 * khẩu dùng lại POST /auth/change-password đã có sẵn (xem AuthController), không lặp lại ở đây. */
@ApiBearerAuth()
@ApiTags("me-union-member")
@UseGuards(JwtAuthGuard)
@Controller("me/union-member")
export class MeUnionMemberController {
  constructor(
    private readonly unionMembersService: UnionMembersService,
    private readonly profileChanges: UnionMemberProfileChangeRequestsService,
    private readonly uploadsService: UploadsService
  ) {}

  @Get()
  findMine(@CurrentUser() user: JwtAccessPayload): Promise<MyUnionMemberDto> {
    return this.unionMembersService.findMyUnionMember(user.sub);
  }

  @Patch()
  updateMine(@CurrentUser() user: JwtAccessPayload, @Body() dto: UpdateMyUnionMemberDto): Promise<MyUnionMemberDto> {
    return this.unionMembersService.updateMyUnionMember(user.sub, dto);
  }

  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"]
    }
  })
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }))
  @Post("photo")
  uploadPhoto(@UploadedFile() file: UploadedImageFile | undefined): UploadImageResponseDto {
    return this.uploadsService.saveMemberImage(file);
  }

  @Post("profile-change-requests")
  submitProfileChange(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: SubmitProfileChangeDto
  ): Promise<MyUnionMemberDto> {
    return this.profileChanges.submit(user.sub, dto);
  }

  @Delete("profile-change-requests/pending")
  cancelPending(@CurrentUser() user: JwtAccessPayload): Promise<MyUnionMemberDto> {
    return this.profileChanges.cancelPending(user.sub);
  }
}
