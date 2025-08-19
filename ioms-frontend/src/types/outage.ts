// src/types/outage.ts

// Tipos Básicos
export type UserRole = 'dev' | 'key_user' | 'admin';
export type CriticalityLevel = '1 (highest)' | '2' | '3' | '4' | '5 (lowest)';
export type Environment = string;
export type LocationCode = 'GUA' | 'SJC' | 'OTHER';

// Status de Outage expandido
export type OutageStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_progress' | 'completed';

// Tipos de Aplicação (Novos)
export type ApplicationVitality = CriticalityLevel;

export interface Application {
  id: string;
  name: string;
  description: string;
  vitality: ApplicationVitality;
  environments: Environment[];
  locations: ApplicationLocation[];
  createdAt: string;
  createdBy: string;
}

export interface ApplicationLocation {
  code: LocationCode;
  keyUsers: KeyUserRef[];
  description?: string;
}

export interface KeyUserRef {
  id: string;
  email: string;
  name?: string;
}

// Tipos de Outage (Expandido com funcionalidades de workflow)
export interface Outage {
  id: string;
  title: string;
  application: string;
  applicationId?: string;
  location: LocationCode;
  environment: Environment[];
  start: string;
  end: string;
  status: OutageStatus;
  requester: string;
  requesterId?: string;
  criticality: CriticalityLevel;
  reason: string;
  createdAt?: string;
  locationCode?: LocationCode;
  
  // Novos campos para workflow
  approverId?: string;
  approver?: User;
  approvedAt?: string;
  rejectionReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  startedAt?: string;
  completedAt?: string;
  
  // Campos para notificações
  notificationsSent?: boolean;
  lastNotificationSent?: string;
  
  // Campos para validações
  conflicts?: OutageConflict[];
  validationErrors?: string[];
}

// Conflito de horários
export interface OutageConflict {
  id: string;
  conflictingOutageId: string;
  conflictingOutageTitle: string;
  conflictType: 'overlap' | 'adjacent' | 'same_application' | 'same_location';
  severity: 'high' | 'medium' | 'low';
  description: string;
}

// Histórico de mudanças
export interface OutageChangeHistory {
  id: string;
  outageId: string;
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: string;
  reason?: string;
  changeType: 'create' | 'update' | 'status_change' | 'approval' | 'rejection' | 'cancellation';
}

// Workflow de aprovação
export interface ApprovalWorkflow {
  id: string;
  outageId: string;
  currentStep: number;
  totalSteps: number;
  steps: ApprovalStep[];
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  approverId: string;
  approver: User;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedAt?: string;
  rejectedAt?: string;
  reason?: string;
  order: number;
}

// Notificação em tempo real
export interface OutageNotification {
  id: string;
  outageId: string;
  type: 'created' | 'updated' | 'approved' | 'rejected' | 'cancelled' | 'conflict_detected' | 'reminder';
  title: string;
  message: string;
  recipientId: string;
  recipient: User;
  read: boolean;
  createdAt: string;
  readAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Validação de conflitos
export interface ConflictValidation {
  hasConflicts: boolean;
  conflicts: OutageConflict[];
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

// Tipos de Usuário (Aprimorado)
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  locations: LocationCode[];
  assignedApplications?: Array<{
    id: string;
    name: string;
  }>;
  invitedAt?: string;
  invitedBy?: string;
  
  // Novos campos para workflow
  canApproveOutages?: boolean;
  approvalLevel?: number;
  notificationPreferences?: NotificationPreferences;
}

// Preferências de notificação
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  outageUpdates: boolean;
  approvalRequests: boolean;
  conflictAlerts: boolean;
  reminders: boolean;
}

// Tipos para Convites (Novo)
export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  locations: LocationCode[];
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
}

// Filtros avançados para outages
export interface OutageFilters {
  status?: OutageStatus[];
  criticality?: CriticalityLevel[];
  applicationId?: string[];
  location?: LocationCode[];
  environment?: string[];
  requesterId?: string;
  approverId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  hasConflicts?: boolean;
  needsApproval?: boolean;
  companyId?: string;
  // Propriedades de paginação
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Resposta paginada para outages
export interface PaginatedOutagesResponse {
  outages: Outage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}