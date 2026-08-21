import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface RecordChangeParams {
  actorUserId: string;
  action: "create" | "update" | "delete" | "approve" | "import";
  entityType: string;
  entityId: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
}

/**
 * Ghi nhật ký thao tác cho các bảng dữ liệu nhạy cảm (mục 8 CURSOR_PROMPT_Website_CongDoan_UTEHY.md).
 * Gọi ở cuối mỗi service method create/update/delete/approve của các entity cần audit.
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: RecordChangeParams) {
    await this.prisma.auditLog.create({
      data: {
        actorUserId: params.actorUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changesJson: params.changes ? JSON.stringify(params.changes) : null
      }
    });
  }
}
