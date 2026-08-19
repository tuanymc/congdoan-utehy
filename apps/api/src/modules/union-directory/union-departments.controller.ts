import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { UnionDepartmentDto } from "@congdoan/types";
import { UnionDepartmentsService } from "./union-departments.service";

/** Endpoint công khai — dùng cho bộ lọc "Thuộc Công đoàn bộ phận" ở trang danh bạ công đoàn viên. */
@ApiTags("union-departments")
@Controller("union-departments")
export class UnionDepartmentsController {
  constructor(private readonly unionDepartmentsService: UnionDepartmentsService) {}

  @Get()
  list(): Promise<UnionDepartmentDto[]> {
    return this.unionDepartmentsService.list();
  }
}
