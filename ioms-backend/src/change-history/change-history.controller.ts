import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ChangeHistoryService } from './change-history.service';
import { ChangeHistoryFiltersDto } from './dto/change-history-filters.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('change-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChangeHistoryController {
  constructor(private readonly changeHistoryService: ChangeHistoryService) {}

  @Get('outage/:outageId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getOutageChangeHistory(@Param('outageId') outageId: string) {
    return this.changeHistoryService.getOutageChangeHistory(outageId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getChangeHistory(@Query() filters: ChangeHistoryFiltersDto) {
    return this.changeHistoryService.getChangeHistory(filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getChangeById(@Param('id') id: string) {
    return this.changeHistoryService.getChangeById(id);
  }

  @Get('outage/:outageId/field-summary')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getFieldChangeSummary(@Param('outageId') outageId: string) {
    return this.changeHistoryService.getFieldChangeSummary(outageId);
  }

  @Get('audit-trail/:outageId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getAuditTrail(@Param('outageId') outageId: string) {
    return this.changeHistoryService.getAuditTrail(outageId);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getUserChangeHistory(
    @Param('userId') userId: string,
    @Query() filters: Omit<ChangeHistoryFiltersDto, 'changedBy'>
  ) {
    return this.changeHistoryService.getUserChangeHistory(userId, filters);
  }

  @Get('field/:field')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getFieldChangeHistory(
    @Param('field') field: string,
    @Query() filters: Omit<ChangeHistoryFiltersDto, 'field'>
  ) {
    return this.changeHistoryService.getFieldChangeHistory(field, filters);
  }

  @Post('comment')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  addComment(@Body() addCommentDto: AddCommentDto) {
    return this.changeHistoryService.addComment(addCommentDto);
  }

  @Get('statistics/summary')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getChangeStatistics(
    @Query('companyId') companyId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
    return this.changeHistoryService.getChangeStatistics(companyId, dateRange);
  }
}
