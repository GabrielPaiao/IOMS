// src/types/user.ts
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'dev' | 'key_user' | 'admin';
  locations: string[]; // Mude de location para array de strings
};