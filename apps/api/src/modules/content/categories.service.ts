import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { CategoryDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { slugify } from "../../common/utils/slugify";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async list(): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    return categories;
  }

  async findOne(id: string): Promise<CategoryDto> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Không tìm thấy chuyên mục.");
    return category;
  }

  async create(dto: CreateCategoryDto, actorUserId: string): Promise<CategoryDto> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException("Slug chuyên mục đã tồn tại.");

    const category = await this.prisma.category.create({
      data: { name: dto.name, slug, description: dto.description, sortOrder: dto.sortOrder ?? 0 }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "Category", entityId: category.id });
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, actorUserId: string): Promise<CategoryDto> {
    await this.findOne(id);
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug ? slugify(dto.slug) : undefined,
        description: dto.description,
        sortOrder: dto.sortOrder
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "Category", entityId: id });
    return category;
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "Category", entityId: id });
  }
}
