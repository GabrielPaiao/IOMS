// src/outages/interfaces/outage.interface.ts
import { Outage, Application, User } from '@prisma/client';

export interface OutageWithRelations extends Outage {
  application: Application;
  createdByUser: User;
  approvedByUser?: User;
  cancelledByUser?: User;
  approvalWorkflows?: any[];
  history?: any[];
  notifications?: any[];
  chatConversation?: any;
}