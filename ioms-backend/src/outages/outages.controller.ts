// src/outages/outages.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OutagesService } from './outages.service';
import { CreateOutageDto } from './dto/create-outage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('outages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OutagesController {
  constructor(private readonly outagesService: OutagesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  create(@Body() createOutageDto: CreateOutageDto, @Request() req) {
    return this.outagesService.create(createOutageDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  findAll(@Query() query: any, @Request() req) {
    const companyId = req.user.companyId;
    return this.outagesService.findAll(companyId, query);
  }

  @Get('my-outages')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  findMyOutages(@Request() req) {
    return this.outagesService.findByUser(req.user.id);
  }

  @Get('pending-approval')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  findPendingApproval(@Request() req) {
    return this.outagesService.findPendingApproval(req.user.companyId);
  }

  @Get('calendar')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getCalendar(@Query() query: any, @Request() req) {
    const companyId = req.user.companyId;
    return this.outagesService.getCalendar(companyId, query);
  }

  @Get('conflicts')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  checkConflicts(@Query() query: any, @Request() req) {
    const companyId = req.user.companyId;
    return this.outagesService.checkConflicts(companyId, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  findOne(@Param('id') id: string) {
    return this.outagesService.findOne(id);
  }

  @Get(':id/history')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getHistory(@Param('id') id: string) {
    return this.outagesService.getHistory(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  update(
    @Param('id') id: string,
    @Body() updateOutageDto: any,
    @Request() req,
  ) {
    return this.outagesService.update(id, updateOutageDto, req.user.id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  approveOutage(
    @Param('id') id: string,
    @Body() approvalData: any,
    @Request() req,
  ) {
    return this.outagesService.approveOutage(id, req.user.id, approvalData);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  rejectOutage(
    @Param('id') id: string,
    @Body() rejectionData: any,
    @Request() req,
  ) {
    return this.outagesService.rejectOutage(id, req.user.id, rejectionData);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  cancelOutage(
    @Param('id') id: string,
    @Body() cancellationData: any,
    @Request() req,
  ) {
    return this.outagesService.cancelOutage(id, req.user.id, cancellationData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.outagesService.remove(id);
  }

  @Get('stats/summary')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getStatsSummary(@Request() req) {
    return this.outagesService.getStatsSummary(req.user.companyId);
  }

  @Get('stats/by-application')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getStatsByApplication(@Request() req) {
    return this.outagesService.getStatsByApplication(req.user.companyId);
  }

  @Get('stats/by-criticality')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getStatsByCriticality(@Request() req) {
    return this.outagesService.getStatsByCriticality(req.user.companyId);
  }

  @Get('stats/by-status')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getStatsByStatus(@Request() req) {
    return this.outagesService.getStatsByStatus(req.user.companyId);
  }
}