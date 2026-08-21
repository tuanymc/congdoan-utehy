import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { UnionCommitteeMemberDto } from "@congdoan/types";
import { UnionCommitteeMembersService } from "./union-committee-members.service";
import { QueryUnionCommitteeMembersDto } from "./dto/query-union-committee-members.dto";

/** Endpoint công khai — trang "Ban chấp hành Công đoàn". Truyền termId để xem theo nhiệm kỳ (thường
 * là nhiệm kỳ isCurrent=true lấy từ GET /union-terms), departmentId="__school__" để chỉ lấy Ban chấp
 * hành cấp trường, hoặc 1 departmentId cụ thể để xem Ban chấp hành/tổ công đoàn bộ phận đó. */
@ApiTags("union-committee-members")
@Controller("union-committee-members")
export class UnionCommitteeMembersController {
  constructor(private readonly unionCommitteeMembersService: UnionCommitteeMembersService) {}

  @Get()
  list(@Query() query: QueryUnionCommitteeMembersDto): Promise<UnionCommitteeMemberDto[]> {
    return this.unionCommitteeMembersService.list(query);
  }
}
