import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { UnionTermDto } from "@congdoan/types";
import { UnionTermsService } from "./union-terms.service";

/** Endpoint công khai — trang "Ban chấp hành Công đoàn" (thay 1 phần nội dung tĩnh web cũ). FE tự
 * chọn nhiệm kỳ mặc định hiển thị (isCurrent=true) từ danh sách trả về, hoặc cho người xem tự chuyển
 * qua nhiệm kỳ khác để xem lịch sử. */
@ApiTags("union-terms")
@Controller("union-terms")
export class UnionTermsController {
  constructor(private readonly unionTermsService: UnionTermsService) {}

  @Get()
  list(): Promise<UnionTermDto[]> {
    return this.unionTermsService.list();
  }
}
