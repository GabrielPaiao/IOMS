import api from './api';
import type { OutageChangeHistory, Outage } from '../types/outage';

export interface ChangeHistoryFilters {
  outageId?: string;
  field?: string;
  changeType?: string[];
  changedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  page?: number;
  limit?: number;
}

export interface ChangeSummary {
  field: string;
  changeCount: number;
  lastChange: string;
  lastChangedBy: string;
  mostCommonValue: any;
}

export interface AuditTrail {
  outageId: string;
  changes: OutageChangeHistory[];
  summary: {
    totalChanges: number;
    uniqueUsers: string[];
    dateRange: {
      start: string;
      end: string;
    };
  };
}

class ChangeHistoryService {
  // Obter histórico de mudanças de um outage
  async getOutageChangeHistory(outageId: string): Promise<OutageChangeHistory[]> {
    const response = await api.get<OutageChangeHistory[]>(`/change-history/outage/${outageId}`);
    return response.data;
  }

  // Obter histórico com filtros
  async getChangeHistory(filters?: ChangeHistoryFilters): Promise<{
    changes: OutageChangeHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await api.get('/change-history', { params: filters });
    return response.data;
  }

  // Obter mudança específica por ID
  async getChangeById(id: string): Promise<OutageChangeHistory> {
    const response = await api.get<OutageChangeHistory>(`/change-history/${id}`);
    return response.data;
  }

  // Obter resumo de mudanças por campo
  async getFieldChangeSummary(outageId: string): Promise<ChangeSummary[]> {
    const response = await api.get<ChangeSummary[]>(`/change-history/outage/${outageId}/field-summary`);
    return response.data;
  }

  // Obter trilha de auditoria completa
  async getAuditTrail(outageId: string): Promise<AuditTrail> {
    const response = await api.get<AuditTrail>(`/change-history/audit-trail/${outageId}`);
    return response.data;
  }

  // Obter histórico de mudanças por usuário
  async getUserChangeHistory(userId: string, filters?: Omit<ChangeHistoryFilters, 'changedBy'>): Promise<{
    changes: OutageChangeHistory[];
    total: number;
    summary: {
      totalChanges: number;
      outagesAffected: number;
      mostChangedFields: string[];
    };
  }> {
    const response = await api.get(`/change-history/user/${userId}`, { params: filters });
    return response.data;
  }

  // Obter histórico de mudanças por campo específico
  async getFieldChangeHistory(
    field: string,
    filters?: Omit<ChangeHistoryFilters, 'field'>
  ): Promise<{
    changes: OutageChangeHistory[];
    total: number;
    summary: {
      totalChanges: number;
      uniqueUsers: string[];
      valueDistribution: Array<{ value: any; count: number }>;
    };
  }> {
    const response = await api.get(`/change-history/field/${field}`, { params: filters });
    return response.data;
  }

  // Obter histórico de mudanças por tipo
  async getChangeTypeHistory(
    changeType: string,
    filters?: Omit<ChangeHistoryFilters, 'changeType'>
  ): Promise<{
    changes: OutageChangeHistory[];
    total: number;
    summary: {
      totalChanges: number;
      outagesAffected: number;
      averageChangesPerOutage: number;
    };
  }> {
    const response = await api.get(`/change-history/type/${changeType}`, { params: filters });
    return response.data;
  }

  // Obter histórico de mudanças por período
  async getChangeHistoryByPeriod(
    startDate: string,
    endDate: string,
    filters?: Omit<ChangeHistoryFilters, 'dateRange'>
  ): Promise<{
    changes: OutageChangeHistory[];
    total: number;
    summary: {
      totalChanges: number;
      uniqueUsers: string[];
      outagesAffected: number;
      changeTrend: Array<{ date: string; count: number }>;
    };
  }> {
    const response = await api.get('/change-history/period', {
      params: { startDate, endDate, ...filters }
    });
    return response.data;
  }

  // Obter estatísticas de mudanças
  async getChangeStatistics(companyId?: string): Promise<{
    totalChanges: number;
    changesToday: number;
    changesThisWeek: number;
    changesThisMonth: number;
    mostActiveUsers: Array<{ userId: string; changeCount: number; name: string }>;
    mostChangedFields: Array<{ field: string; changeCount: number }>;
    changeTrend: Array<{ period: string; count: number }>;
  }> {
    const response = await api.get('/change-history/statistics', { params: { companyId } });
    return response.data;
  }

  // Exportar histórico de mudanças
  async exportChangeHistory(
    filters?: ChangeHistoryFilters,
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ): Promise<Blob> {
    const response = await api.get('/change-history/export', {
      params: { ...filters, format },
      responseType: 'blob'
    });
    return response.data;
  }

  // Obter comparação de versões
  async compareVersions(
    outageId: string,
    version1: string,
    version2: string
  ): Promise<{
    differences: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      changeType: 'added' | 'removed' | 'modified';
    }>;
    summary: {
      totalDifferences: number;
      addedFields: number;
      removedFields: number;
      modifiedFields: number;
    };
  }> {
    const response = await api.get(`/change-history/compare`, {
      params: { outageId, version1, version2 }
    });
    return response.data;
  }

  // Obter versões disponíveis de um outage
  async getOutageVersions(outageId: string): Promise<Array<{
    version: string;
    timestamp: string;
    changedBy: string;
    changeType: string;
    description: string;
  }>> {
    const response = await api.get<Array<{
      version: string;
      timestamp: string;
      changedBy: string;
      changeType: string;
      description: string;
    }>>(`/change-history/outage/${outageId}/versions`);
    return response.data;
  }

  // Restaurar versão anterior
  async restoreVersion(outageId: string, version: string, reason?: string): Promise<{
    success: boolean;
    restoredFields: string[];
    newChangeId: string;
  }> {
    const response = await api.post(`/change-history/outage/${outageId}/restore`, {
      version,
      reason
    });
    return response.data;
  }

  // Obter histórico de aprovações
  async getApprovalHistory(outageId: string): Promise<Array<{
    timestamp: string;
    action: 'approved' | 'rejected' | 'requested_changes';
    user: string;
    reason?: string;
    comments?: string;
    changes?: Partial<Outage>;
  }>> {
    const response = await api.get(`/change-history/outage/${outageId}/approvals`);
    return response.data;
  }

  // Obter histórico de comentários
  async getCommentHistory(outageId: string): Promise<Array<{
    id: string;
    timestamp: string;
    user: string;
    comment: string;
    type: 'general' | 'approval' | 'rejection' | 'change_request';
    relatedChangeId?: string;
  }>> {
    const response = await api.get(`/change-history/outage/${outageId}/comments`);
    return response.data;
  }

  // Adicionar comentário ao histórico
  async addComment(
    outageId: string,
    comment: string,
    type: 'general' | 'approval' | 'rejection' | 'change_request' = 'general',
    relatedChangeId?: string
  ): Promise<{
    id: string;
    timestamp: string;
    success: boolean;
  }> {
    const response = await api.post(`/change-history/outage/${outageId}/comments`, {
      comment,
      type,
      relatedChangeId
    });
    return response.data;
  }

  // Obter relatório de conformidade
  async getComplianceReport(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalOutages: number;
    compliantOutages: number;
    nonCompliantOutages: number;
    complianceRate: number;
    violations: Array<{
      outageId: string;
      violationType: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    recommendations: string[];
  }> {
    const response = await api.get('/change-history/compliance-report', {
      params: { companyId, startDate, endDate }
    });
    return response.data;
  }
}

export const changeHistoryService = new ChangeHistoryService();
export default changeHistoryService;
