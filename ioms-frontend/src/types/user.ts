// src/types/user.ts
export type User = {
  id: string;
  name?: string; // Opcional para compatibilidade
  firstName: string;
  lastName: string;
  email: string;
  role: 'dev' | 'key_user' | 'admin';
  location?: string; // Localização base do usuário
  locations: string[]; // Array de localizações (para compatibilidade)
  companyId: string;
  companyName?: string;
  assignedApplications?: Array<{
    id: string;
    name: string;
  }>;
  invitedAt?: string;
  invitedBy?: string;
  
  // Novos campos para workflow
  canApproveOutages?: boolean;
  approvalLevel?: number;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    outageUpdates: boolean;
    approvalRequests: boolean;
    conflictAlerts: boolean;
    reminders: boolean;
  };
};