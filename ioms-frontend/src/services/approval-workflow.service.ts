import api from './api';
import type { ApprovalWorkflow, ApprovalStep, Outage } from '../types/outage';

export interface CreateWorkflowRequest {
  outageId: string;
  approvers: Array<{
    userId: string;
    order: number;
    required: boolean;
  }>;
  autoApprove?: boolean;
  deadline?: string;
}

export interface ApprovalRequest {
  outageId: string;
  workflowId: string;
  stepId: string;
  action: 'approve' | 'reject' | 'request_changes';
  reason?: string;
  comments?: string;
  changes?: Partial<Outage>;
}

export interface WorkflowFilters {
  status?: string[];
  approverId?: string;
  outageId?: string;
  companyId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

class ApprovalWorkflowService {
  // Criar novo workflow de aprovação
  async createWorkflow(request: CreateWorkflowRequest): Promise<ApprovalWorkflow> {
    const response = await api.post<ApprovalWorkflow>('/approval-workflows', request);
    return response.data;
  }

  // Obter workflow por ID
  async getWorkflowById(id: string): Promise<ApprovalWorkflow> {
    const response = await api.get<ApprovalWorkflow>(`/approval-workflows/${id}`);
    return response.data;
  }

  // Obter workflow por outage
  async getWorkflowByOutage(outageId: string): Promise<ApprovalWorkflow> {
    const response = await api.get<ApprovalWorkflow>(`/approval-workflows/outage/${outageId}`);
    return response.data;
  }

  // Listar workflows com filtros
  async getWorkflows(filters?: WorkflowFilters): Promise<ApprovalWorkflow[]> {
    const response = await api.get<ApprovalWorkflow[]>('/approval-workflows', { params: filters });
    return response.data;
  }

  // Aprovar etapa do workflow
  async approveStep(request: ApprovalRequest): Promise<ApprovalStep> {
    const response = await api.post<ApprovalStep>('/approval-workflows/approve', request);
    return response.data;
  }

  // Rejeitar etapa do workflow
  async rejectStep(request: ApprovalRequest): Promise<ApprovalStep> {
    const response = await api.post<ApprovalStep>('/approval-workflows/reject', request);
    return response.data;
  }

  // Solicitar mudanças
  async requestChanges(request: ApprovalRequest): Promise<ApprovalStep> {
    const response = await api.post<ApprovalStep>('/approval-workflows/request-changes', request);
    return response.data;
  }

  // Pular etapa (se permitido)
  async skipStep(workflowId: string, stepId: string, reason?: string): Promise<ApprovalStep> {
    const response = await api.patch<ApprovalStep>(`/approval-workflows/${workflowId}/steps/${stepId}/skip`, {
      reason
    });
    return response.data;
  }

  // Reatribuir aprovador
  async reassignApprover(
    workflowId: string,
    stepId: string,
    newApproverId: string,
    reason?: string
  ): Promise<ApprovalStep> {
    const response = await api.patch<ApprovalStep>(`/approval-workflows/${workflowId}/steps/${stepId}/reassign`, {
      newApproverId,
      reason
    });
    return response.data;
  }

  // Adicionar aprovador ao workflow
  async addApprover(
    workflowId: string,
    approver: {
      userId: string;
      order: number;
      required: boolean;
    }
  ): Promise<ApprovalWorkflow> {
    const response = await api.post<ApprovalWorkflow>(`/approval-workflows/${workflowId}/approvers`, approver);
    return response.data;
  }

  // Remover aprovador do workflow
  async removeApprover(workflowId: string, stepId: string): Promise<void> {
    await api.delete(`/approval-workflows/${workflowId}/steps/${stepId}`);
  }

  // Cancelar workflow
  async cancelWorkflow(workflowId: string, reason?: string): Promise<ApprovalWorkflow> {
    const response = await api.patch<ApprovalWorkflow>(`/approval-workflows/${workflowId}/cancel`, { reason });
    return response.data;
  }

  // Reabrir workflow cancelado
  async reopenWorkflow(workflowId: string, reason?: string): Promise<ApprovalWorkflow> {
    const response = await api.patch<ApprovalWorkflow>(`/approval-workflows/${workflowId}/reopen`, { reason });
    return response.data;
  }

  // Obter próximas etapas pendentes
  async getPendingSteps(workflowId: string): Promise<ApprovalStep[]> {
    const response = await api.get<ApprovalStep[]>(`/approval-workflows/${workflowId}/pending-steps`);
    return response.data;
  }

  // Obter histórico de aprovações
  async getApprovalHistory(workflowId: string): Promise<Array<{
    step: ApprovalStep;
    action: string;
    timestamp: string;
    user: string;
    comments?: string;
  }>> {
    const response = await api.get(`/approval-workflows/${workflowId}/history`);
    return response.data;
  }

  // Configurar aprovação automática
  async configureAutoApproval(
    workflowId: string,
    config: {
      enabled: boolean;
      conditions: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
      timeout?: number; // em minutos
    }
  ): Promise<ApprovalWorkflow> {
    const response = await api.put<ApprovalWorkflow>(`/approval-workflows/${workflowId}/auto-approval`, config);
    return response.data;
  }

  // Obter estatísticas de workflow
  async getWorkflowStats(companyId?: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    averageApprovalTime: number; // em minutos
    bottlenecks: Array<{
      step: string;
      averageTime: number;
      count: number;
    }>;
  }> {
    const response = await api.get('/approval-workflows/stats', { params: { companyId } });
    return response.data;
  }

  // Configurar notificações de workflow
  async configureWorkflowNotifications(
    workflowId: string,
    notifications: {
      onStepComplete: boolean;
      onWorkflowComplete: boolean;
      onDeadlineApproaching: boolean;
      onEscalation: boolean;
      recipients: string[];
    }
  ): Promise<void> {
    await api.put(`/approval-workflows/${workflowId}/notifications`, notifications);
  }

  // Escalar workflow (notificar superiores)
  async escalateWorkflow(
    workflowId: string,
    reason: string,
    escalationLevel: number
  ): Promise<void> {
    await api.post(`/approval-workflows/${workflowId}/escalate`, {
      reason,
      escalationLevel
    });
  }

  // Obter templates de workflow
  async getWorkflowTemplates(companyId?: string): Promise<Array<{
    id: string;
    name: string;
    description: string;
    approvers: Array<{
      role: string;
      order: number;
      required: boolean;
    }>;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  }>> {
    const response = await api.get('/approval-workflows/templates', { params: { companyId } });
    return response.data;
  }

  // Aplicar template a um outage
  async applyTemplate(outageId: string, templateId: string): Promise<ApprovalWorkflow> {
    const response = await api.post<ApprovalWorkflow>(`/outages/${outageId}/apply-workflow-template`, {
      templateId
    });
    return response.data;
  }

  // Duplicar workflow existente
  async duplicateWorkflow(
    sourceWorkflowId: string,
    newOutageId: string,
    modifications?: Partial<CreateWorkflowRequest>
  ): Promise<ApprovalWorkflow> {
    const response = await api.post<ApprovalWorkflow>(`/approval-workflows/${sourceWorkflowId}/duplicate`, {
      newOutageId,
      modifications
    });
    return response.data;
  }
}

export const approvalWorkflowService = new ApprovalWorkflowService();
export default approvalWorkflowService;
