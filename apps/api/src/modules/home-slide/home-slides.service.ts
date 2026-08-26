import { Injectable, NotFoundException } from "@nestjs/common";
import { HOME_BANNER_PLACEMENTS, type HomeBannerPlacement, type HomeSlideDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateHomeSlideDto } from "./dto/create-home-slide.dto";
import { UpdateHomeSlideDto } from "./dto/update-home-slide.dto";

function toPlacement(value: string): HomeBannerPlacement {
  return HOME_BANNER_PLACEMENTS.includes(value as HomeBannerPlacement)
    ? (value as HomeBannerPlacement)
    : "SLIDER";
}

function toDto(slide: {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  placement: string;
}): HomeSlideDto {
  return {
    id: slide.id,
    name: slide.name,
    imageUrl: slide.imageUrl,
    linkUrl: slide.linkUrl,
    sortOrder: slide.sortOrder,
    isActive: slide.isActive,
    placement: toPlacement(slide.placement)
  };
}

@Injectable()
export class HomeSlidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  /** Công khai — CHỈ trả banner isActive=true (khớp tblSlide.Active=1 web cũ). Trang chủ tự lọc theo
   * placement (slider / dưới slide / trên footer). */
  async listActive(): Promise<HomeSlideDto[]> {
    const slides = await this.prisma.homeSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    });
    return slides.map(toDto);
  }

  /** Quản trị — trả toàn bộ kể cả banner đang tắt, để admin bật lại được. */
  async listForAdmin(): Promise<HomeSlideDto[]> {
    const slides = await this.prisma.homeSlide.findMany({ orderBy: { sortOrder: "asc" } });
    return slides.map(toDto);
  }

  async findOne(id: string): Promise<HomeSlideDto> {
    const slide = await this.prisma.homeSlide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundException("Không tìm thấy banner.");
    return toDto(slide);
  }

  async create(dto: CreateHomeSlideDto, actorUserId: string): Promise<HomeSlideDto> {
    const slide = await this.prisma.homeSlide.create({
      data: {
        name: dto.name,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        placement: dto.placement ?? "SLIDER"
      }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "HomeSlide", entityId: slide.id });
    return toDto(slide);
  }

  async update(id: string, dto: UpdateHomeSlideDto, actorUserId: string): Promise<HomeSlideDto> {
    await this.findOne(id);
    const slide = await this.prisma.homeSlide.update({
      where: { id },
      data: {
        name: dto.name,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
        placement: dto.placement
      }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "HomeSlide", entityId: id });
    return toDto(slide);
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.homeSlide.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "HomeSlide", entityId: id });
  }
}
