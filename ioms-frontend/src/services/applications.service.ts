import api from './api';

export interface Application {
  id: string;
  name: string;
  description: string;
  companyId: string;
  environments: Array<{ environment: string }>;
  locations: Array<{ code: string; name: string }>;
  version?: string;
  technology?: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    outages: number;
  };
}

export interface CreateApplicationRequest {
  name: string;
  description: string;
  companyId: string;
  environments: string[];
  locations: string[];
  version?: string;
  technology?: string;
  owner?: string;
}

export interface UpdateApplicationRequest extends Partial<CreateApplicationRequest> {}

export interface ApplicationFilters {
  environment?: string;
  location?: string;
  search?: string;
}

class ApplicationsService {
  // Criar nova aplicação
  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    try {
      const response = await api.post('/applications', data);
      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  // Obter todas as aplicações
  async getApplications(filters?: ApplicationFilters): Promise<Application[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await api.get(`/applications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  // Obter aplicação por ID
  async getApplicationById(id: string): Promise<Application> {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  }

  // Obter aplicações por empresa
  async getApplicationsByCompany(companyId: string): Promise<Application[]> {
    try {
      const response = await api.get(`/applications/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company applications:', error);
      throw error;
    }
  }

  // Atualizar aplicação
  async updateApplication(id: string, data: UpdateApplicationRequest): Promise<Application> {
    try {
      const response = await api.patch(`/applications/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  // Remover aplicação
  async deleteApplication(id: string): Promise<void> {
    try {
      await api.delete(`/applications/${id}`);
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }

  // Obter estatísticas da aplicação
  async getApplicationStats(id: string): Promise<any> {
    try {
      const response = await api.get(`/applications/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  }
}

export const applicationsService = new ApplicationsService();
export default applicationsService;
