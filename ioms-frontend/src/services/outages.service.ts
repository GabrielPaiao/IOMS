import api from './api';
import type { Outage } from '../types/outage';

export interface CreateOutageRequest {
  applicationId: string;
  companyId: string;
  scheduledStart: string;
  scheduledEnd: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  estimatedDuration: number;
  description?: string;
}

export interface UpdateOutageRequest {
  scheduledStart?: string;
  scheduledEnd?: string;
  criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason?: string;
  estimatedDuration?: number;
  description?: string;
}

export interface OutageFilters {
  status?: string;
  criticality?: string;
  applicationId?: string;
  environment?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

class OutagesService {
  // Criar nova outage
  async createOutage(data: CreateOutageRequest): Promise<Outage> {
    try {
      const response = await api.post('/outages', data);
      return response.data;
    } catch (error) {
      console.error('Error creating outage:', error);
      throw error;
    }
  }

  // Obter todas as outages com filtros
  async getOutages(filters?: OutageFilters): Promise<Outage[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await api.get(`/outages?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching outages:', error);
      throw error;
    }
  }

  // Obter outage por ID
  async getOutageById(id: string): Promise<Outage> {
    try {
      const response = await api.get(`/outages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching outage:', error);
      throw error;
    }
  }

  // Obter minhas outages
  async getMyOutages(): Promise<Outage[]> {
    try {
      const response = await api.get('/outages/my-outages');
      return response.data;
    } catch (error) {
      console.error('Error fetching my outages:', error);
      throw error;
    }
  }

  // Obter outages pendentes de aprovação
  async getPendingApproval(): Promise<Outage[]> {
    try {
      const response = await api.get('/outages/pending-approval');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending outages:', error);
      throw error;
    }
  }

  // Obter calendário de outages
  async getCalendar(filters?: { startDate?: string; endDate?: string }): Promise<Outage[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await api.get(`/outages/calendar?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar:', error);
      throw error;
    }
  }

  // Verificar conflitos
  async checkConflicts(filters?: { startDate?: string; endDate?: string }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await api.get(`/outages/conflicts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      throw error;
    }
  }

  // Atualizar outage
  async updateOutage(id: string, data: UpdateOutageRequest): Promise<Outage> {
    try {
      const response = await api.patch(`/outages/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating outage:', error);
      throw error;
    }
  }

  // Aprovar outage
  async approveOutage(id: string, reason?: string, comments?: string): Promise<Outage> {
    try {
      const response = await api.patch(`/outages/${id}/approve`, {
        reason,
        comments,
      });
      return response.data;
    } catch (error) {
      console.error('Error approving outage:', error);
      throw error;
    }
  }

  // Rejeitar outage
  async rejectOutage(id: string, reason?: string, comments?: string): Promise<Outage> {
    try {
      const response = await api.patch(`/outages/${id}/reject`, {
        reason,
        comments,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting outage:', error);
      throw error;
    }
  }

  // Cancelar outage
  async cancelOutage(id: string, reason?: string): Promise<Outage> {
    try {
      const response = await api.patch(`/outages/${id}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling outage:', error);
      throw error;
    }
  }

  // Remover outage
  async deleteOutage(id: string): Promise<void> {
    try {
      await api.delete(`/outages/${id}`);
    } catch (error) {
      console.error('Error deleting outage:', error);
      throw error;
    }
  }

  // Obter histórico de outage
  async getOutageHistory(id: string): Promise<any[]> {
    try {
      const response = await api.get(`/outages/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching outage history:', error);
      throw error;
    }
  }

  // Estatísticas
  async getStatsSummary(): Promise<any> {
    try {
      const response = await api.get('/outages/stats/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats summary:', error);
      throw error;
    }
  }

  async getStatsByApplication(): Promise<any[]> {
    try {
      const response = await api.get('/outages/stats/by-application');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats by application:', error);
      throw error;
    }
  }

  async getStatsByCriticality(): Promise<any[]> {
    try {
      const response = await api.get('/outages/stats/by-criticality');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats by criticality:', error);
      throw error;
    }
  }

  async getStatsByStatus(): Promise<any[]> {
    try {
      const response = await api.get('/outages/stats/by-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats by status:', error);
      throw error;
    }
  }

  // Enviar notificações (placeholder para integração futura)
  async sendOutageNotifications(outageId: string, action: string): Promise<void> {
    try {
      // TODO: Implementar integração com serviço de notificações
      console.log(`Notification sent for outage ${outageId}: ${action}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

export const outagesService = new OutagesService();
export default outagesService; 