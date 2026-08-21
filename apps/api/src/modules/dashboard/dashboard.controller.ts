import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { DashboardOverviewDto } from "@congdoan/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";

@ApiBearerAuth()
@ApiTags("admin-dashboard")
@UseGuards(JwtAuthGuard)
@Controller("admin/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  overview(): Promise<DashboardOverviewDto> {
    return this.dashboardService.overview();
  }
}
