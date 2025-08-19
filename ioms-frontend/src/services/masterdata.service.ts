import api from './api';

export interface Application {
  id: string;
  name: string;
  description: string;
  vitality: string;
  environments: string[];
  locations: Array<{
    code: string;
    keyUsers: Array<{ id: string; email: string }>;
    description: string;
  }>;
  createdAt: string;
  createdBy: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  description: string;
  companyId: string;
}

export interface Environment {
  id: string;
  name: string;
  description: string;
  companyId: string;
}

class MasterDataService {
  // Aplicações
  async getApplications(companyId?: string): Promise<Application[]> {
    const response = await api.get<Application[]>('/applications', { 
      params: { companyId } 
    });
    return response.data;
  }

  async getApplicationById(id: string): Promise<Application> {
    const response = await api.get<Application>(`/applications/${id}`);
    return response.data;
  }

  async createApplication(data: Partial<Application>): Promise<Application> {
    const response = await api.post<Application>('/applications', data);
    return response.data;
  }

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    const response = await api.put<Application>(`/applications/${id}`, data);
    return response.data;
  }

  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  }

  // Localizações
  async getLocations(companyId?: string): Promise<Location[]> {
    const response = await api.get<Location[]>('/locations', { 
      params: { companyId } 
    });
    return response.data;
  }

  async getLocationById(id: string): Promise<Location> {
    const response = await api.get<Location>(`/locations/${id}`);
    return response.data;
  }

  async createLocation(data: Partial<Location>): Promise<Location> {
    const response = await api.post<Location>('/locations', data);
    return response.data;
  }

  async updateLocation(id: string, data: Partial<Location>): Promise<Location> {
    const response = await api.put<Location>(`/locations/${id}`, data);
    return response.data;
  }

  async deleteLocation(id: string): Promise<void> {
    await api.delete(`/locations/${id}`);
  }

  // Ambientes
  async getEnvironments(companyId?: string): Promise<Environment[]> {
    const response = await api.get<Environment[]>('/environments', { 
      params: { companyId } 
    });
    return response.data;
  }

  async getEnvironmentById(id: string): Promise<Environment> {
    const response = await api.get<Environment>(`/environments/${id}`);
    return response.data;
  }

  async createEnvironment(data: Partial<Environment>): Promise<Environment> {
    const response = await api.post<Environment>('/environments', data);
    return response.data;
  }

  async updateEnvironment(id: string, data: Partial<Environment>): Promise<Environment> {
    const response = await api.put<Environment>(`/environments/${id}`, data);
    return response.data;
  }

  async deleteEnvironment(id: string): Promise<void> {
    await api.delete(`/environments/${id}`);
  }

  // Métodos utilitários
  async getMasterData(companyId?: string) {
    const [applications, locations, environments] = await Promise.all([
      this.getApplications(companyId),
      this.getLocations(companyId),
      this.getEnvironments(companyId)
    ]);

    return {
      applications,
      locations,
      environments
    };
  }
}

export const masterDataService = new MasterDataService();
export default masterDataService;
