import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationQuery, PostDetailDto, PostListItemDto, PostStatus } from "@congdoan/types";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { slugify } from "../../common/utils/slugify";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

const postWithRelations = Prisma.validator<Prisma.PostDefaultArgs>()({
  include: { category: true, author: { select: { fullName: true } } }
});
type PostWithRelations = Prisma.PostGetPayload<typeof postWithRelations>;

function toListItem(p: PostWithRelations): PostListItemDto {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    status: p.status as PostStatus,
    category: p.category,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString()
  };
}

function toDetail(p: PostWithRelations): PostDetailDto {
  return {
    ...toListItem(p),
    content: p.content,
    authorFullName: p.author.fullName,
    updatedAt: p.updatedAt.toISOString()
  };
}

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  /** Danh sách công khai — chỉ bài đã PUBLISHED. Dùng cho apps/web. */
  async listPublished(query: PaginationQuery & { categorySlug?: string }): Promise<PaginatedResult<PostListItemDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.PostWhereInput = {
      status: "PUBLISHED",
      ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
      ...(query.search ? { title: { contains: query.search } } : {})
    };

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({ where, ...postWithRelations, orderBy: { publishedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize })
    ]);

    return { items: posts.map(toListItem), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /** Chi tiết công khai theo slug — chỉ trả về nếu đã PUBLISHED. */
  async findPublishedBySlug(slug: string): Promise<PostDetailDto> {
    const post = await this.prisma.post.findFirst({ where: { slug, status: "PUBLISHED" }, ...postWithRelations });
    if (!post) throw new NotFoundException("Không tìm thấy bài viết.");
    return toDetail(post);
  }

  /** Danh sách cho trang quản trị — bao gồm mọi trạng thái. */
  async listForAdmin(
    query: PaginationQuery & { status?: PostStatus; categorySlug?: string }
  ): Promise<PaginatedResult<PostListItemDto>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.PostWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
      ...(query.search ? { title: { contains: query.search } } : {})
    };

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({ where, ...postWithRelations, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize })
    ]);

    return { items: posts.map(toListItem), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOneForAdmin(id: string): Promise<PostDetailDto> {
    const post = await this.prisma.post.findUnique({ where: { id }, ...postWithRelations });
    if (!post) throw new NotFoundException("Không tìm thấy bài viết.");
    return toDetail(post);
  }

  async create(dto: CreatePostDto, authorId: string): Promise<PostDetailDto> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const existing = await this.prisma.post.findUnique({ where: { slug } });
    if (existing) throw new ConflictException("Slug bài viết đã tồn tại.");

    const status = dto.status ?? "DRAFT";
    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        categoryId: dto.categoryId,
        coverImageUrl: dto.coverImageUrl,
        status,
        authorId,
        publishedAt: status === "PUBLISHED" ? new Date() : null
      },
      ...postWithRelations
    });

    await this.auditLog.record({ actorUserId: authorId, action: "create", entityType: "Post", entityId: post.id });
    return toDetail(post);
  }

  async update(id: string, dto: UpdatePostDto, actorUserId: string): Promise<PostDetailDto> {
    const before = await this.findOneForAdmin(id);

    const becomingPublished = dto.status === "PUBLISHED" && before.status !== "PUBLISHED";
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug ? slugify(dto.slug) : undefined,
        excerpt: dto.excerpt,
        content: dto.content,
        categoryId: dto.categoryId,
        coverImageUrl: dto.coverImageUrl,
        status: dto.status,
        publishedAt: becomingPublished ? new Date() : undefined
      },
      ...postWithRelations
    });

    await this.auditLog.record({
      actorUserId,
      action: "update",
      entityType: "Post",
      entityId: id,
      changes: { status: { before: before.status, after: post.status } }
    });
    return toDetail(post);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOneForAdmin(id);
    await this.prisma.post.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "Post", entityId: id });
  }
}
