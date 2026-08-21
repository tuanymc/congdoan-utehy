import { Injectable, NotFoundException } from "@nestjs/common";
import type { UnionTermDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateUnionTermDto } from "./dto/create-union-term.dto";
import { UpdateUnionTermDto } from "./dto/update-union-term.dto";

/** Nhiệm kỳ Ban chấp hành công đoàn — nguồn NHIEMKY (xem chú thích domain block UnionTerm trong
 * prisma/schema.prisma). Bảng nhỏ, không cần phân trang — giống UnionDepartmentsService.list(). */
@Injectable()
export class UnionTermsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async list(): Promise<UnionTermDto[]> {
    return this.prisma.unionTerm.findMany({ orderBy: [{ sortOrder: "asc" }, { startYear: "desc" }] });
  }

  async findOne(id: string): Promise<UnionTermDto> {
    const term = await this.prisma.unionTerm.findUnique({ where: { id } });
    if (!term) throw new NotFoundException("Không tìm thấy nhiệm kỳ.");
    return term;
  }

  async create(dto: CreateUnionTermDto, actorUserId: string): Promise<UnionTermDto> {
    const term = await this.prisma.unionTerm.create({
      data: {
        name: dto.name,
        startYear: dto.startYear,
        endYear: dto.endYear,
        description: dto.description,
        isCurrent: dto.isCurrent ?? false,
        sortOrder: dto.sortOrder ?? 0
      }
    });
    if (term.isCurrent) {
      await this.clearOtherCurrentTerms(term.id);
    }
    await this.auditLog.record({ actorUserId, action: "create", entityType: "UnionTerm", entityId: term.id });
    return term;
  }

  async update(id: string, dto: UpdateUnionTermDto, actorUserId: string): Promise<UnionTermDto> {
    await this.findOne(id);
    const term = await this.prisma.unionTerm.update({
      where: { id },
      data: {
        name: dto.name,
        startYear: dto.startYear,
        endYear: dto.endYear,
        description: dto.description,
        isCurrent: dto.isCurrent,
        sortOrder: dto.sortOrder
      }
    });
    if (term.isCurrent) {
      await this.clearOtherCurrentTerms(term.id);
    }
    await this.auditLog.record({ actorUserId, action: "update", entityType: "UnionTerm", entityId: id });
    return term;
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    // Xoá nhiệm kỳ sẽ Cascade xoá luôn toàn bộ bản ghi Ban chấp hành thuộc nhiệm kỳ đó (xem
    // UnionCommitteeMember.term onDelete: Cascade trong prisma/schema.prisma) — KHÔNG xoá bản thân
    // UnionMember/UnionDepartment liên quan.
    await this.prisma.unionTerm.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "UnionTerm", entityId: id });
  }

  /** Đảm bảo tại một thời điểm chỉ có TỐI ĐA 1 nhiệm kỳ isCurrent=true — không ràng buộc được ở mức DB
   * (không dùng unique partial index qua Prisma), nên tự đảm bảo ở service khi set 1 nhiệm kỳ khác
   * thành current. */
  private async clearOtherCurrentTerms(exceptId: string): Promise<void> {
    await this.prisma.unionTerm.updateMany({
      where: { id: { not: exceptId }, isCurrent: true },
      data: { isCurrent: false }
    });
  }
}
