import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { PublicMenuItemDto } from "@congdoan/types";
import { MenuItemsService } from "./menu-items.service";

/** Endpoint công khai — cây menu điều hướng chính cho apps/web Header.tsx. */
@ApiTags("menu")
@Controller("menu")
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  getTree(): Promise<PublicMenuItemDto[]> {
    return this.menuItemsService.getPublicTree();
  }
}
