import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";
import type { CategoryDto } from "@congdoan/types";
import { CategoriesService } from "./categories.service";

class QueryCategoriesDto {
  /** ?aboutOnly=true — chỉ trả chuyên mục thuộc nhóm "Giới thiệu" (Category.isAboutSection=true),
   * dùng cho apps/web trang Giới thiệu. Bỏ trống -> trả toàn bộ chuyên mục như trước. */
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  aboutOnly?: boolean;
}

/** Endpoint công khai — apps/web dùng để hiển thị danh sách chuyên mục tin tức. */
@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(@Query() query: QueryCategoriesDto): Promise<CategoryDto[]> {
    return this.categoriesService.list(query.aboutOnly);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<CategoryDto> {
    return this.categoriesService.findOne(id);
  }
}
