import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { JwtAccessPayload, PaginatedResult, PostDetailDto, PostListItemDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { QueryAdminPostsDto } from "./dto/query-posts.dto";

/**
 * CRUD bài viết cho trang quản trị (apps/admin — resource "posts" trong Refine).
 * Đây là module MẪU minh hoạ pattern RBAC + audit log cho các module Phase 2+ tiếp theo.
 */
@ApiBearerAuth()
@ApiTags("admin-posts")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("admin/posts")
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @RequirePermissions("post:view")
  @Get()
  list(@Query() query: QueryAdminPostsDto): Promise<PaginatedResult<PostListItemDto>> {
    return this.postsService.listForAdmin(query);
  }

  @RequirePermissions("post:view")
  @Get(":id")
  findOne(@Param("id") id: string): Promise<PostDetailDto> {
    return this.postsService.findOneForAdmin(id);
  }

  @RequirePermissions("post:create")
  @Post()
  create(@Body() dto: CreatePostDto, @CurrentUser() actor: JwtAccessPayload): Promise<PostDetailDto> {
    return this.postsService.create(dto, actor.sub);
  }

  @RequirePermissions("post:update")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() actor: JwtAccessPayload
  ): Promise<PostDetailDto> {
    return this.postsService.update(id, dto, actor.sub);
  }

  @RequirePermissions("post:delete")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() actor: JwtAccessPayload): Promise<void> {
    return this.postsService.remove(id, actor.sub);
  }
}
