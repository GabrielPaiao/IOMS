// src/mocks/outageMocks.ts
import type { Outage, CriticalityLevel, UserRole } from '../types/outage';

// Tipos auxiliares para os mocks
type Environment = 'Production' | 'Staging' | 'Development' | 'DR' | 'Test';
type ApplicationCode = 'ERP' | 'CRM' | 'HRIS';
type LocationCode = 'GUA' | 'SJC' | 'OTHER';

// 1. Configurações de aplicações e environments
export const applicationsEnvironmentsMock: Record<ApplicationCode, Environment[]> = {
  ERP: ['Production', 'Staging', 'DR'],
  CRM: ['Production', 'Staging', 'Test'],
  HRIS: ['Production', 'Development']
};

export const applicationNames: Record<ApplicationCode, string> = {
  ERP: 'ERP System',
  CRM: 'CRM Platform',
  HRIS: 'HR Information System'
};

// 2. Dados de autenticação e usuários
export const authMock: Record<UserRole, {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locations: LocationCode[];
}> = {
  dev: {
    id: '1',
    name: 'Developer',
    email: 'dev@example.com',
    role: 'dev',
    locations: ['GUA', 'SJC']
  },
  key_user: {
    id: '2',
    name: 'Key User',
    email: 'keyuser@example.com',
    role: 'key_user',
    locations: ['GUA', 'SJC']
  },
  admin: {
    id: '3',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    locations: ['GUA', 'SJC', 'OTHER']
  }
};

// 3. Solicitações de outage por tipo de visualização
export const outageRequestsMock = {
  devView: [
    createOutageMock({
      id: '101',
      application: 'ERP',
      environments: ['Production'], // Agora é array
      location: 'GUA',
      criticality: '1 (highest)',
      status: 'pending'
    }),
  ],
  
  keyUserView: [
    createOutageMock({
      id: '101',
      application: 'ERP',
      environments: ['Production', 'DR'], // Exemplo com múltiplos environments
      location: 'GUA',
      criticality: '1 (highest)',
      status: 'pending'
    }),
  ]
};

// 4. Detalhes completos de outages
export const outageDetailsMock: Outage[] = [
  createOutageMock({
    id: '101',
    application: 'ERP',
    environments: ['Production'],
    location: 'GUA',
    criticality: '1 (highest)',
    status: 'pending',
    reason: 'Critical security patches that cannot wait until the next maintenance window'
  }),
  createOutageMock({
    id: '102',
    application: 'CRM',
    environments: ['Staging', 'Test'], // Exemplo com múltiplos environments
    location: 'SJC',
    criticality: '3',
    status: 'approved',
    reason: 'Database migration',
    start: '2025-07-26T09:00:00Z',
    end: '2025-07-26T11:00:00Z'
  })
];

// 5. Chats de outage
export const outageChatMock = {
  chat101: [
    {
      id: '1',
      sender: 'dev@company.com',
      message: 'Precisamos atualizar o módulo financeiro',
      timestamp: '2025-07-20T09:15:00Z'
    },
    {
      id: '2',
      sender: 'ku@company.com',
      message: 'Podemos agendar para depois das 14h?',
      timestamp: '2025-07-20T10:30:00Z'
    }
  ]
};

// Função auxiliar para criar outages mockadas consistentemente
function createOutageMock(params: {
  id: string;
  application: ApplicationCode;
  environments: Environment[]; // Alterado para array
  location: LocationCode;
  criticality: CriticalityLevel;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  start?: string;
  end?: string;
}): Outage {
  const defaultDate = '2025-07-25T14:00:00Z';
  return {
    id: params.id,
    title: `Atualização de Segurança do ${applicationNames[params.application]}`,
    application: applicationNames[params.application],
    location: params.location,
    locationCode: params.location,
    environment: params.environments, // Já é array
    start: params.start || defaultDate,
    end: params.end || '2025-07-25T16:00:00Z',
    status: params.status,
    requester: 'dev@company.com',
    criticality: params.criticality,
    reason: params.reason || 'Critical security patches'
  };
}