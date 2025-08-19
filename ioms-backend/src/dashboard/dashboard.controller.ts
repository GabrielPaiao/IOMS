import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getDashboardStats(@Query() filters: DashboardFiltersDto, @Request() req) {
    return this.dashboardService.getDashboardStats(req.user.companyId, filters);
  }

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getCompanyOverview(@Request() req) {
    return this.dashboardService.getCompanyOverview(req.user.companyId);
  }

  @Get('applications/:applicationId/performance')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getApplicationPerformance(
    @Param('applicationId') applicationId: string,
    @Request() req,
  ) {
    return this.dashboardService.getApplicationPerformance(
      req.user.companyId,
      applicationId,
    );
  }

  @Get('trends/:period')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getTrends(
    @Param('period') period: 'week' | 'month' | 'quarter',
    @Request() req,
  ) {
    return this.dashboardService.getTrends(req.user.companyId, period);
  }

  @Get('trends')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getDefaultTrends(@Request() req) {
    return this.dashboardService.getTrends(req.user.companyId, 'month');
  }
}
