import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { UnionDepartmentDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { CreateUnionDepartmentDto } from "./dto/create-union-department.dto";
import { UpdateUnionDepartmentDto } from "./dto/update-union-department.dto";

@Injectable()
export class UnionDepartmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  /** Công khai + quản trị dùng chung — bảng nhỏ (CONGDOANBOPHAN gốc), không cần phân trang. */
  async list(): Promise<UnionDepartmentDto[]> {
    return this.prisma.unionDepartment.findMany({ orderBy: { sortOrder: "asc" } });
  }

  async findOne(id: string): Promise<UnionDepartmentDto> {
    const dept = await this.prisma.unionDepartment.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException("Không tìm thấy công đoàn bộ phận.");
    return dept;
  }

  async create(dto: CreateUnionDepartmentDto, actorUserId: string): Promise<UnionDepartmentDto> {
    const dept = await this.prisma.unionDepartment.create({
      data: { name: dto.name, sortOrder: dto.sortOrder ?? 0 }
    });
    await this.auditLog.record({ actorUserId, action: "create", entityType: "UnionDepartment", entityId: dept.id });
    return dept;
  }

  async update(id: string, dto: UpdateUnionDepartmentDto, actorUserId: string): Promise<UnionDepartmentDto> {
    await this.findOne(id);
    const dept = await this.prisma.unionDepartment.update({
      where: { id },
      data: { name: dto.name, sortOrder: dto.sortOrder }
    });
    await this.auditLog.record({ actorUserId, action: "update", entityType: "UnionDepartment", entityId: id });
    return dept;
  }

  async remove(id: string, actorUserId: string): Promise<void> {
    await this.findOne(id);
    // UnionCommitteeMember.departmentId trỏ NoAction (không SetNull/Cascade — xem chú thích schema.prisma
    // lý do bắt buộc, tránh lỗi P1012 nhiều đường cascade hội tụ) nên xoá công đoàn bộ phận còn Ban chấp
    // hành gắn trực tiếp sẽ bị DB chặn bằng lỗi khoá ngoại thô — kiểm tra trước để báo lỗi rõ ràng hơn.
    const committeeAssignmentCount = await this.prisma.unionCommitteeMember.count({ where: { departmentId: id } });
    if (committeeAssignmentCount > 0) {
      throw new BadRequestException(
        `Không thể xoá — công đoàn bộ phận này vẫn còn ${committeeAssignmentCount} thành viên Ban chấp hành gắn trực tiếp. Hãy gỡ hoặc chuyển các thành viên đó sang bộ phận khác trước.`
      );
    }
    await this.prisma.unionDepartment.delete({ where: { id } });
    await this.auditLog.record({ actorUserId, action: "delete", entityType: "UnionDepartment", entityId: id });
  }
}
