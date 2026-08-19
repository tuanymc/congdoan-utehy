import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { AdminCategoriesController } from "./admin-categories.controller";
import { CategoriesService } from "./categories.service";
import { PostsController } from "./posts.controller";
import { AdminPostsController } from "./admin-posts.controller";
import { PostsService } from "./posts.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [CategoriesController, AdminCategoriesController, PostsController, AdminPostsController],
  providers: [CategoriesService, PostsService, AuditLogService]
})
export class ContentModule {}
