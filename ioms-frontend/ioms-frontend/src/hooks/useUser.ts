// src/hooks/useUser.ts
import { useState } from 'react';
import type { UserRole } from '../types/outage';

export function useUser() {
  // Mock inicial - substitua por lógica real de autenticação depois
  const [user] = useState({
    id: '3', // ID do admin por padrão
    role: 'admin' as UserRole,
    email: 'admin@example.com'
  });

  return { user };
}