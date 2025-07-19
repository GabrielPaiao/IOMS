// src/types/outage.ts

// Tipos Básicos
export type UserRole = 'dev' | 'key_user' | 'admin';
export type CriticalityLevel = '1 (highest)' | '2' | '3' | '4' | '5 (lowest)';
export type Environment = string;
export type LocationCode = 'GUA' | 'SJC' | 'OTHER';

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

// Tipos de Outage (Existente - com pequenos ajustes)
export interface Outage {
  id: string;
  title: string;
  application: string;
  applicationId?: string; // Novo campo para referência
  location: LocationCode;
  environment: Environment[];
  start: string;
  end: string;
  status: 'pending' | 'approved' | 'rejected';
  requester: string;
  requesterId?: string; // Novo campo para referência
  criticality: CriticalityLevel;
  reason: string;
  approvedAt?: string;
  createdAt?: string;
  locationCode?: LocationCode;
}

// Tipos de Usuário (Aprimorado)
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locations: LocationCode[];
  applications?: string[]; // IDs de aplicações associadas
  invitedAt?: string;
  invitedBy?: string;
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