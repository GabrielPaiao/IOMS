// src/types/user.ts
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'dev' | 'key_user' | 'admin';
  locations: string[]; // Mude de location para array de strings
  companyId?: string;
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