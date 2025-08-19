import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { ApprovalRequestDto } from './dto/approval-request.dto';
import { WorkflowFiltersDto } from './dto/workflow-filters.dto';

@Injectable()
export class ApprovalWorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async createWorkflow(createWorkflowDto: CreateWorkflowDto) {
    const { outageId, approvers, autoApprove, deadline } = createWorkflowDto;

    // Verificar se o outage existe
    const outage = await this.prisma.outage.findUnique({
      where: { id: outageId },
      include: { application: true }
    });

    if (!outage) {
      throw new NotFoundException('Outage not found');
    }

    // Verificar se já existe um workflow para este outage
    const existingWorkflow = await this.prisma.approvalWorkflow.findFirst({
      where: { outageId }
    });

    if (existingWorkflow) {
      throw new BadRequestException('Workflow already exists for this outage');
    }

    // Criar workflow
    const workflow = await this.prisma.approvalWorkflow.create({
      data: {
        outageId,
        name: `Workflow for Outage ${outage.id}`,
        description: `Approval workflow for the outage scheduled on ${outage.scheduledStart}`,
        steps: {
          create: approvers.map((approver, index) => ({
            assigneeId: approver.userId,
            order: approver.order,
            name: `Step ${index + 1}`,
            type: 'APPROVAL',
          })),
        },
      },
      include: {
        steps: {
          include: {
            assignee: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        outage: {
          include: {
            application: true,
          },
        },
      },
    });

    return workflow;
  }

  async getWorkflowById(id: string) {
    const workflow = await this.prisma.approvalWorkflow.findUnique({
      where: { id },
      include: {
        steps: {
          include: {
            assignee: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { order: 'asc' },
        },
        outage: {
          include: {
            application: true,
            createdByUser: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async getWorkflowByOutage(outageId: string) {
    const workflow = await this.prisma.approvalWorkflow.findFirst({
      where: { outageId },
      include: {
        steps: {
          include: {
            assignee: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { order: 'asc' },
        },
        outage: {
          include: {
            application: true,
            createdByUser: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found for this outage');
    }

    return workflow;
  }

  async getWorkflows(filters: WorkflowFiltersDto) {
    const where: any = {};

    if (filters.status) {
      where.status = { in: filters.status };
    }

    if (filters.approverId) {
      where.steps = {
        some: { assigneeId: filters.approverId },
      };
    }

    if (filters.outageId) {
      where.outageId = filters.outageId;
    }

    if (filters.companyId) {
      where.outage = {
        application: { companyId: filters.companyId }
      };
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: new Date(filters.dateRange.start),
        lte: new Date(filters.dateRange.end)
      };
    }

    return this.prisma.approvalWorkflow.findMany({
      where,
      include: {
        steps: {
          include: {
            assignee: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { order: 'asc' },
        },
        outage: {
          include: {
            application: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveStep(approvalRequest: ApprovalRequestDto) {
    const { outageId, workflowId, stepId, action, reason, comments } = approvalRequest;

    // Verificar se o workflow existe
    const workflow = await this.prisma.approvalWorkflow.findUnique({
      where: { id: workflowId },
      include: { steps: true }
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // Verificar se o step existe
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new NotFoundException('Workflow step not found');
    }

    // Verificar se o step está pendente
    if (step.status !== 'PENDING') {
      throw new BadRequestException('Workflow step is not pending');
    }

    // Atualizar o step
    const updatedStep = await this.prisma.workflowStep.update({
      where: { id: stepId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        comments,
        completedAt: new Date(),
      },
    });

    // Verificar se todos os steps foram aprovados
    const allSteps = await this.prisma.workflowStep.findMany({
      where: { workflowId }
    });

    const allApproved = allSteps.every(s => s.status === 'APPROVED');
    const anyRejected = allSteps.some(s => s.status === 'REJECTED');

    // Atualizar status do workflow
    let workflowStatus = 'PENDING';
    if (allApproved) {
      workflowStatus = 'APPROVED';
    } else if (anyRejected) {
      workflowStatus = 'REJECTED';
    }

    await this.prisma.approvalWorkflow.update({
      where: { id: workflowId },
      data: { status: workflowStatus }
    });

    // Se aprovado, atualizar o outage
    if (workflowStatus === 'APPROVED') {
      await this.prisma.outage.update({
        where: { id: outageId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date()
        }
      });
    }

    return updatedStep;
  }

  async rejectStep(approvalRequest: ApprovalRequestDto) {
    return this.approveStep(approvalRequest);
  }

  async requestChanges(approvalRequest: ApprovalRequestDto) {
    const { workflowId, stepId, reason, comments, changes } = approvalRequest;

    // Verificar se o workflow existe
    const workflow = await this.prisma.approvalWorkflow.findUnique({
      where: { id: workflowId },
      include: { steps: true }
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // Verificar se o step existe
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new NotFoundException('Workflow step not found');
    }

    // Atualizar o step
    const updatedStep = await this.prisma.workflowStep.update({
      where: { id: stepId },
      data: {
        status: 'CHANGES_REQUESTED',
        comments,
        completedAt: new Date(),
      },
    });

    // Atualizar status do workflow
    await this.prisma.approvalWorkflow.update({
      where: { id: workflowId },
      data: { status: 'CHANGES_REQUESTED' }
    });

    return updatedStep;
  }

  async skipStep(workflowId: string, stepId: string, reason?: string) {
    const step = await this.prisma.workflowStep.findUnique({
      where: { id: stepId }
    });

    if (!step) {
      throw new NotFoundException('Workflow step not found');
    }

    return this.prisma.workflowStep.update({
      where: { id: stepId },
      data: {
        status: 'SKIPPED',
        completedAt: new Date(),
      },
    });
  }

  async reassignApprover(workflowId: string, stepId: string, newApproverId: string, reason?: string) {
    // Verificar se o novo usuário existe
    const newUser = await this.prisma.user.findUnique({
      where: { id: newApproverId }
    });

    if (!newUser) {
      throw new NotFoundException('New approver not found');
    }

    return this.prisma.workflowStep.update({
      where: { id: stepId },
      data: {
        assigneeId: newApproverId,
        comments: reason || 'Reassigned',
        updatedAt: new Date(),
      },
    });
  }
}
