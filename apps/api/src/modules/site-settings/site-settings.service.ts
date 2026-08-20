import { Injectable } from "@nestjs/common";
import type { SiteSettingDto } from "@congdoan/types";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditLogService } from "../../common/audit-log.service";
import { UpdateSiteSettingDto } from "./dto/update-site-setting.dto";

/** Id cố định duy nhất của dòng cấu hình — xem chú thích domain block SITESETTING trong
 * prisma/schema.prisma (model chỉ có 1 dòng, KHÔNG dùng uuid ngẫu nhiên). */
const SINGLETON_ID = "singleton";

@Injectable()
export class SiteSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  /** Dùng chung cho cả endpoint công khai (GET /site-settings) và trang quản trị — tự tạo dòng mặc
   * định (toàn bộ giá trị lấy từ @default trong schema, các field còn lại null) nếu đây là lần đầu
   * chạy, tránh phải chạy seed thủ công mới có dữ liệu để hiển thị. */
  async getOrCreate(): Promise<SiteSettingDto> {
    return this.prisma.siteSetting.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID }
    });
  }

  async update(dto: UpdateSiteSettingDto, actorUserId: string): Promise<SiteSettingDto> {
    const updated = await this.prisma.siteSetting.upsert({
      where: { id: SINGLETON_ID },
      update: dto,
      // Nếu chưa từng có dòng nào (chưa gọi getOrCreate lần nào) — tạo luôn với dữ liệu vừa gửi lên,
      // field nào không gửi thì dùng @default trong schema.
      create: { id: SINGLETON_ID, ...dto }
    });
    await this.auditLog.record({
      actorUserId,
      action: "update",
      entityType: "SiteSetting",
      entityId: SINGLETON_ID
    });
    return updated;
  }
}
