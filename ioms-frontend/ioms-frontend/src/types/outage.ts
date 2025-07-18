// src/types/outage.ts
export type UserRole = 'dev' | 'key_user' | 'admin';
export type CriticalityLevel = '1 (highest)' | '2' | '3' | '4' | '5 (lowest)';
export type Environment = string;
export type LocationCode = 'GUA' | 'SJC' | 'OTHER'; // Add this type

export interface Outage {
  id: string;
  title: string;
  application: string;
  location: LocationCode; // Changed from string to LocationCode
  environment: Environment[];
  start: string;
  end: string;
  status: 'pending' | 'approved' | 'rejected';
  requester: string;
  criticality: CriticalityLevel;
  reason: string;
  approvedAt?: string;
  createdAt?: string;
  locationCode?: LocationCode; // Made consistent with location type
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locations: LocationCode[]; // Changed to array and specific type
}