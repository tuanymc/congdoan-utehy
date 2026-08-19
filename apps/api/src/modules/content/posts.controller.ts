import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PaginatedResult, PostDetailDto, PostListItemDto } from "@congdoan/types";
import { PostsService } from "./posts.service";
import { QueryPublicPostsDto } from "./dto/query-posts.dto";

/** Endpoint công khai — apps/web dùng cho trang danh sách/chi tiết tin tức. Chỉ trả bài đã PUBLISHED. */
@ApiTags("posts")
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  list(@Query() query: QueryPublicPostsDto): Promise<PaginatedResult<PostListItemDto>> {
    return this.postsService.listPublished(query);
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string): Promise<PostDetailDto> {
    return this.postsService.findPublishedBySlug(slug);
  }
}
