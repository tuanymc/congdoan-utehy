import { Module } from "@nestjs/common";
import { MenuItemsController } from "./menu-items.controller";
import { AdminMenuItemsController } from "./admin-menu-items.controller";
import { MenuItemsService } from "./menu-items.service";
import { AuditLogService } from "../../common/audit-log.service";

@Module({
  controllers: [MenuItemsController, AdminMenuItemsController],
  providers: [MenuItemsService, AuditLogService]
})
export class MenuItemModule {}
