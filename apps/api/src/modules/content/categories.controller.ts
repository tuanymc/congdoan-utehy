import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { CategoryDto } from "@congdoan/types";
import { CategoriesService } from "./categories.service";

/** Endpoint công khai — apps/web dùng để hiển thị danh sách chuyên mục tin tức. */
@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(): Promise<CategoryDto[]> {
    return this.categoriesService.list();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<CategoryDto> {
    return this.categoriesService.findOne(id);
  }
}
