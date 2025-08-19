import api from './api';

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  environment?: string;
  criticality?: string;
  applicationId?: string;
  location?: string;
}

export interface DashboardStats {
  overview: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  };
  criticality: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  applications: {
    total: number;
    top: any[];
    byApplication: any[];
  };
  environments: {
    byEnvironment: any[];
  };
  locations: {
    byLocation: any[];
  };
  timeline: {
    byMonth: any[];
  };
  performance: {
    averageApprovalTime: number;
    minApprovalTime: number;
    maxApprovalTime: number;
  };
  users: {
    byUser: any[];
  };
}

export interface CompanyOverview {
  summary: {
    applications: number;
    users: number;
    outages: number;
    activeOutages: number;
  };
  recentActivity: any[];
  approvalStats: any[];
}

export interface ApplicationPerformance {
  summary: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    approvalRate: number;
  };
  performance: {
    averageApprovalTime: number;
    totalApprovalTime: number;
    approvalCount: number;
  };
  distribution: {
    criticality: any[];
    environment: any[];
  };
  recentOutages: any[];
}

export interface Trends {
  period: string;
  startDate: Date;
  endDate: Date;
  trends: {
    daily: any[];
    status: any[];
    criticality: any[];
  };
}

class DashboardService {
  // Obter estatísticas do dashboard
  async getDashboardStats(filters?: DashboardFilters): Promise<DashboardStats> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await api.get(`/dashboard/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Obter visão geral da empresa
  async getCompanyOverview(): Promise<CompanyOverview> {
    try {
      const response = await api.get('/dashboard/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching company overview:', error);
      throw error;
    }
  }

  // Obter performance de uma aplicação
  async getApplicationPerformance(applicationId: string): Promise<ApplicationPerformance> {
    try {
      const response = await api.get(`/dashboard/applications/${applicationId}/performance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application performance:', error);
      throw error;
    }
  }

  // Obter tendências
  async getTrends(period: 'week' | 'month' | 'quarter' = 'month'): Promise<Trends> {
    try {
      const response = await api.get(`/dashboard/trends/${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  }

  // Obter tendências padrão (mês)
  async getDefaultTrends(): Promise<Trends> {
    try {
      const response = await api.get('/dashboard/trends');
      return response.data;
    } catch (error) {
      console.error('Error fetching default trends:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
