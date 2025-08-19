import api from './api';
import type { Outage, OutageConflict, ConflictValidation } from '../types/outage';

export interface ConflictCheckRequest {
  outageId?: string; // Para validação de edição
  applicationId: string;
  locationId: string;
  environmentIds: string[];
  startTime: string;
  endTime: string;
  excludeOutageId?: string; // Para excluir o próprio outage na validação
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: OutageConflict[];
  warnings: string[];
  recommendations: string[];
}

class ConflictValidationService {
  // Verificar conflitos de horários
  async checkTimeConflicts(request: ConflictCheckRequest): Promise<ConflictValidation> {
    const response = await api.post<ConflictValidation>('/outages/validate/conflicts', request);
    return response.data;
  }

  // Verificar conflitos de aplicação
  async checkApplicationConflicts(applicationId: string, startTime: string, endTime: string): Promise<OutageConflict[]> {
    const response = await api.get<OutageConflict[]>(`/outages/validate/application-conflicts`, {
      params: { applicationId, startTime, endTime }
    });
    return response.data;
  }

  // Verificar conflitos de localização
  async checkLocationConflicts(locationId: string, startTime: string, endTime: string): Promise<OutageConflict[]> {
    const response = await api.get<OutageConflict[]>(`/outages/validate/location-conflicts`, {
      params: { locationId, startTime, endTime }
    });
    return response.data;
  }

  // Verificar conflitos de ambiente
  async checkEnvironmentConflicts(environmentIds: string[], startTime: string, endTime: string): Promise<OutageConflict[]> {
    const response = await api.get<OutageConflict[]>(`/outages/validate/environment-conflicts`, {
      params: { environmentIds, startTime, endTime }
    });
    return response.data;
  }

  // Validação completa de um outage
  async validateOutage(outage: Partial<Outage>): Promise<ValidationResult> {
    const response = await api.post<ValidationResult>('/outages/validate', outage);
    return response.data;
  }

  // Verificar disponibilidade de recursos
  async checkResourceAvailability(
    applicationId: string,
    locationId: string,
    environmentIds: string[],
    startTime: string,
    endTime: string
  ): Promise<{
    available: boolean;
    conflicts: OutageConflict[];
    alternativeSlots: Array<{ start: string; end: string; reason: string }>;
  }> {
    const response = await api.get('/outages/validate/resource-availability', {
      params: { applicationId, locationId, environmentIds, startTime, endTime }
    });
    return response.data;
  }

  // Sugerir horários alternativos
  async suggestAlternativeSlots(
    applicationId: string,
    locationId: string,
    environmentIds: string[],
    preferredStart: string,
    preferredEnd: string,
    duration: number // em minutos
  ): Promise<Array<{ start: string; end: string; score: number; reason: string }>> {
    const response = await api.get('/outages/validate/suggest-slots', {
      params: { applicationId, locationId, environmentIds, preferredStart, preferredEnd, duration }
    });
    return response.data;
  }

  // Verificar regras de negócio
  async checkBusinessRules(outage: Partial<Outage>): Promise<{
    valid: boolean;
    violations: string[];
    warnings: string[];
  }> {
    const response = await api.post('/outages/validate/business-rules', outage);
    return response.data;
  }

  // Validação de permissões
  async checkPermissions(outageId: string, action: 'create' | 'update' | 'delete' | 'approve' | 'reject'): Promise<{
    allowed: boolean;
    reason?: string;
    requiredRole?: string;
  }> {
    const response = await api.get(`/outages/validate/permissions`, {
      params: { outageId, action }
    });
    return response.data;
  }

  // Verificar sobreposição de manutenções
  async checkMaintenanceOverlap(
    applicationId: string,
    startTime: string,
    endTime: string
  ): Promise<{
    hasOverlap: boolean;
    overlappingMaintenance: Array<{
      id: string;
      title: string;
      start: string;
      end: string;
      type: string;
    }>;
  }> {
    const response = await api.get('/outages/validate/maintenance-overlap', {
      params: { applicationId, startTime, endTime }
    });
    return response.data;
  }

  // Validação de janelas de manutenção
  async validateMaintenanceWindow(
    applicationId: string,
    startTime: string,
    endTime: string
  ): Promise<{
    valid: boolean;
    reason?: string;
    allowedWindows: Array<{ start: string; end: string; description: string }>;
  }> {
    const response = await api.get('/outages/validate/maintenance-window', {
      params: { applicationId, startTime, endTime }
    });
    return response.data;
  }

  // Verificar dependências entre aplicações
  async checkApplicationDependencies(
    applicationId: string,
    startTime: string,
    endTime: string
  ): Promise<{
    hasDependencies: boolean;
    dependentApplications: Array<{
      id: string;
      name: string;
      dependencyType: 'required' | 'optional' | 'conflicting';
      impact: 'high' | 'medium' | 'low';
    }>;
  }> {
    const response = await api.get('/outages/validate/dependencies', {
      params: { applicationId, startTime, endTime }
    });
    return response.data;
  }

  // Validação de impacto
  async validateImpact(
    outage: Partial<Outage>
  ): Promise<{
    impactLevel: 'critical' | 'high' | 'medium' | 'low';
    affectedUsers: number;
    affectedServices: string[];
    recommendations: string[];
  }> {
    const response = await api.post('/outages/validate/impact', outage);
    return response.data;
  }

  // Verificar conflitos de calendário
  async checkCalendarConflicts(
    startTime: string,
    endTime: string,
    companyId: string
  ): Promise<{
    hasConflicts: boolean;
    conflicts: Array<{
      type: 'holiday' | 'blackout' | 'maintenance' | 'other';
      title: string;
      start: string;
      end: string;
      description: string;
    }>;
  }> {
    const response = await api.get('/outages/validate/calendar-conflicts', {
      params: { startTime, endTime, companyId }
    });
    return response.data;
  }
}

export const conflictValidationService = new ConflictValidationService();
export default conflictValidationService;
