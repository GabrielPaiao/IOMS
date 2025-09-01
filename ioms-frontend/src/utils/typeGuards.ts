// src/utils/typeGuards.ts
import type { CriticalityLevel } from '../types/outage';

export const isCriticalityLevel = (value: string): value is CriticalityLevel => {
  return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(value);
};

export const getSafeCriticality = (value: string): CriticalityLevel => {
  return isCriticalityLevel(value) ? value : 'LOW';
};