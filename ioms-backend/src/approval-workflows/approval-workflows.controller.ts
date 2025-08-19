import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApprovalWorkflowsService } from './approval-workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { ApprovalRequestDto } from './dto/approval-request.dto';
import { WorkflowFiltersDto } from './dto/workflow-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('approval-workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalWorkflowsController {
  constructor(private readonly approvalWorkflowsService: ApprovalWorkflowsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  createWorkflow(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.approvalWorkflowsService.createWorkflow(createWorkflowDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getWorkflows(@Query() filters: WorkflowFiltersDto) {
    return this.approvalWorkflowsService.getWorkflows(filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getWorkflowById(@Param('id') id: string) {
    return this.approvalWorkflowsService.getWorkflowById(id);
  }

  @Get('outage/:outageId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  getWorkflowByOutage(@Param('outageId') outageId: string) {
    return this.approvalWorkflowsService.getWorkflowByOutage(outageId);
  }

  @Post('approve')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  approveStep(@Body() approvalRequest: ApprovalRequestDto) {
    return this.approvalWorkflowsService.approveStep(approvalRequest);
  }

  @Post('reject')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  rejectStep(@Body() approvalRequest: ApprovalRequestDto) {
    return this.approvalWorkflowsService.rejectStep(approvalRequest);
  }

  @Post('request-changes')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  requestChanges(@Body() approvalRequest: ApprovalRequestDto) {
    return this.approvalWorkflowsService.requestChanges(approvalRequest);
  }

  @Patch(':workflowId/steps/:stepId/skip')
  @Roles(UserRole.ADMIN)
  skipStep(
    @Param('workflowId') workflowId: string,
    @Param('stepId') stepId: string,
    @Body('reason') reason?: string
  ) {
    return this.approvalWorkflowsService.skipStep(workflowId, stepId, reason);
  }

  @Patch(':workflowId/steps/:stepId/reassign')
  @Roles(UserRole.ADMIN)
  reassignApprover(
    @Param('workflowId') workflowId: string,
    @Param('stepId') stepId: string,
    @Body('newApproverId') newApproverId: string,
    @Body('reason') reason?: string
  ) {
    return this.approvalWorkflowsService.reassignApprover(workflowId, stepId, newApproverId, reason);
  }
}
