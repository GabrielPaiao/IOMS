// src/mocks/dataMocks.ts
import type { 
  Outage, 
  CriticalityLevel, 
  UserRole, 
  Application as AppType, 
  LocationCode 
} from '../types/outage';

// Tipos auxiliares compartilhados
type Environment = 'Production' | 'Staging' | 'Development' | 'DR' | 'Test';
type ApplicationCode = 'ERP' | 'CRM' | 'HRIS';

// Mapeamento de nomes de aplicações
const applicationNames: Record<ApplicationCode, string> = {
  ERP: 'ERP System',
  CRM: 'CRM Platform',
  HRIS: 'HR Information System'
};

// 1. Dados de aplicações
export const mockApplications: AppType[] = [
  {
    id: '1',
    name: applicationNames.ERP,
    description: 'Enterprise Resource Planning',
    vitality: '1 (highest)',
    environments: ['Production', 'Staging'],
    locations: [
      {
        code: 'GUA',
        keyUsers: [
          { id: '2', email: 'ku_erp@company.com' }
        ],
        description: ''
      }
    ],
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    companyId: 'company-1'
  },
  {
    id: '2',
    name: applicationNames.CRM,
    description: 'Customer Relationship Management',
    vitality: '2',
    environments: ['Production', 'Staging'],
    locations: [
      {
        code: 'SJC',
        keyUsers: [
          { id: '3', email: 'ku_crm@company.com' }
        ],
        description: ''
      }
    ],
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    companyId: 'company-1'
  }
];

// 2. Configurações complementares
export const applicationsEnvironmentsMock: Record<ApplicationCode, Environment[]> = {
  ERP: ['Production', 'Staging', 'DR'],
  CRM: ['Production', 'Staging', 'Test'],
  HRIS: ['Production', 'Development']
};

// 3. Dados de autenticação
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

// 4. Outages
export const outageDetailsMock: Outage[] = [
  createOutageMock({
    id: '101',
    applicationCode: 'ERP',
    applicationId: '1',
    environments: ['Production'],
    location: 'GUA',
    criticality: '1 (highest)',
    status: 'pending',
    reason: 'Critical security patches',
    start: '2025-07-25T14:00:00Z',
    end: '2025-07-25T16:00:00Z'
  }),
  createOutageMock({
    id: '102',
    applicationCode: 'CRM',
    applicationId: '2',
    environments: ['Staging'],
    location: 'SJC',
    criticality: '3',
    status: 'approved',
    reason: 'Database migration',
    start: '2025-07-26T09:00:00Z',
    end: '2025-07-26T11:00:00Z'
  })
];

// Função auxiliar aprimorada
function createOutageMock(params: {
  id: string;
  applicationCode: ApplicationCode;
  applicationId?: string;
  environments: Environment[];
  location: LocationCode;
  criticality: CriticalityLevel;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  start?: string;
  end?: string;
}): Outage {
  const app = mockApplications.find(a => a.id === params.applicationId) || {
    id: params.applicationId || '',
    name: applicationNames[params.applicationCode]
  };

  return {
    id: params.id,
    title: `Maintenance - ${app.name}`,
    application: app.name,
    applicationId: app.id,
    location: params.location,
    locationCode: params.location,
    environment: params.environments,
    start: params.start || new Date().toISOString(),
    end: params.end || new Date(Date.now() + 3600000).toISOString(), // 1 hour later
    status: params.status,
    requester: authMock.dev.email, // Default to dev user
    criticality: params.criticality,
    reason: params.reason || 'Scheduled maintenance',
    createdAt: new Date().toISOString(),
    approvedAt: params.status === 'approved' ? new Date().toISOString() : undefined
  };
}

export type TrendDirection = 'up' | 'down' | 'stable';

export interface DashboardStats {
  outages: {
    approved: number;
    rejected: number;
    scheduled: number;
    byCriticality: Record<CriticalityLevel, number>;
  };
  timing: {
    outageDuration: {
      average: string;
      min: string;
      max: string;
      trend: TrendDirection;
    };
    responseTime: {
      average: string;
      min: string;
      max: string;
      trend: TrendDirection;
    };
  };
  approvalMetrics: {
    rate: number;
    trend: TrendDirection;
    byApprover: Array<{
      name: string;
      count: number;
    }>;
  };
  topPerformers: {
    requesters: Array<{
      name: string;
      count: number;
    }>;
    sites: Array<{
      name: string;
      count: number;
    }>;
    environments: Array<{
      name: string;
      count: number;
    }>;
  };
}

export const dashboardStats: DashboardStats = {
  outages: {
    approved: 24,
    rejected: 8,
    scheduled: 15,
    byCriticality: {
      '1 (highest)': 12,
      '2': 18,
      '3': 10,
      '4': 7,
      '5 (lowest)': 3 
    }
  },
  timing: {
    outageDuration: {
      average: '2h 15m',
      min: '30m',
      max: '8h',
      trend: 'down'
    },
    responseTime: {
      average: '45m',
      min: '5m',
      max: '3h',
      trend: 'up'
    }
  },
  approvalMetrics: {
    rate: 75,
    trend: 'up',
    byApprover: [
      { name: 'Admin User', count: 18 },
      { name: 'Operations Team', count: 6 },
      { name: 'Security Team', count: 3 }
    ]
  },
  topPerformers: {
    requesters: [
      { name: 'dev@example.com', count: 15 },
      { name: 'ops@example.com', count: 10 },
      { name: 'sec@example.com', count: 5 }
    ],
    sites: [
      { name: 'GUA', count: 20 },
      { name: 'SJC', count: 15 },
      { name: 'OTHER', count: 5 }
    ],
    environments: [
      { name: 'Production', count: 25 },
      { name: 'Staging', count: 10 },
      { name: 'Development', count: 5 }
    ]
  }
};

export const getFilterOptions = () => {
  return {
    applications: mockApplications.map(app => app.name),
    environments: ['Production', 'Staging', 'Development', 'DR', 'Test'],
    locations: ['GUA', 'SJC', 'OTHER'],
    criticalities: ['1 (highest)', '2', '3', '4', '5 (lowest)'] as CriticalityLevel[],
    timeRanges: [
      { value: '7', label: 'Last 7 days' },
      { value: '30', label: 'Last 30 days' },
      { value: '90', label: 'Last 90 days' },
      { value: '365', label: 'Last year' }
    ]
  };
};