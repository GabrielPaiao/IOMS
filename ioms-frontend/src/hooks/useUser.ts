// src/hooks/useUser.ts
import { useState } from 'react';
import type { UserRole } from '../types/outage';
import { authMock } from '../mocks/dataMocks';

export function useUser(initialRole: UserRole = 'admin') {
  // Mock inicial usando os dados do dataMocks
  const [user] = useState(authMock[initialRole]);

  return { user };
}