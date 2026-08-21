import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import type {
  JwtAccessPayload,
  PaginatedResult,
  UnionMemberAdminDetailDto,
  UnionMemberImportResultDto,
  UnionMemberListItemDto
} from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UnionMembersService } from "./union-members.service";
import { UnionMembersExcelService, type UploadedExcelFile } from "./union-members-excel.service";
import { CreateUnionMemberDto } from "./dto/create-union-member.dto";
import { UpdateUnionMemberDto } from "./dto/update-union-member.dto";
import { QueryUnionMembersDto } from "./dto/query-union-members.dto";

/** CRUD "Công đoàn viên" cho trang quản trị — bảo vệ theo permission "unionmember:*". Khác endpoint
 * công khai, trả về TOÀN BỘ (kể cả isPublic=false) để admin có thể tự bật/tắt hiển thị. */
@ApiBearerAuth()
@ApiTags("admin-union-members")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/union-members")
export class AdminUnionMembersController {
  constructor(
    private readonly unionMembersService: UnionMembersService,
    private readonly unionMembersExcelService: UnionMembersExcelService
  ) {}

  @RequirePermissions("unionmember:view")
  @Get()
  list(@Query() query: QueryUnionMembersDto): Promise<PaginatedResult<UnionMemberListItemDto>> {
    return this.unionMembersService.listForAdmin(query);
  }

  // Đặt TRƯỚC @Get(":id") — Nest/Express khớp route theo đúng thứ tự khai báo trong controller, nếu
  // để sau thì "export.xlsx" sẽ bị ":id" nuốt mất (khớp như 1 id thường).
  @RequirePermissions("unionmember:view")
  @Get("export.xlsx")
  async exportXlsx(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const buffer = await this.unionMembersExcelService.exportToBuffer();
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="cong-doan-vien-${new Date().toISOString().slice(0, 10)}.xlsx"`
    });
    return new StreamableFile(buffer);
  }

  // Cần cả 2 quyền vì import vừa TẠO MỚI (Mã cán bộ không khớp) vừa CẬP NHẬT (khớp) tuỳ từng dòng —
  // xem UnionMembersExcelService.importFromBuffer. Multer memory storage (không truyền `storage`) nên
  // @UploadedFile() trả buffer trong RAM, không có file tạm trên đĩa cần dọn.
  @RequirePermissions("unionmember:create", "unionmember:update")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  @Post("import")
  importXlsx(
    @UploadedFile() file: UploadedExcelFile | undefined,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UnionMemberImportResultDto> {
    if (!file) {
      throw new BadRequestException("Chưa chọn file Excel để import.");
    }
    return this.unionMembersExcelService.importFromBuffer(file, actor.sub);
  }

  @RequirePermissions("unionmember:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<UnionMemberAdminDetailDto> {
    return this.unionMembersService.findOneForAdmin(id);
  }

  @RequirePermissions("unionmember:create")
  @Post()
  create(@Body() dto: CreateUnionMemberDto, @CurrentUser() actor: JwtAccessPayload): Promise<UnionMemberAdminDetailDto> {
    return this.unionMembersService.create(dto, actor.sub);
  }

  @RequirePermissions("unionmember:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateUnionMemberDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<UnionMemberAdminDetailDto> {
    return this.unionMembersService.update(id, dto, actor.sub);
  }

  @RequirePermissions("unionmember:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.unionMembersService.remove(id, actor.sub);
  }
}
