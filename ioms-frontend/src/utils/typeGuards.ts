// src/utils/typeGuards.ts
import type { CriticalityLevel } from '../types/outage';

export const isCriticalityLevel = (value: string): value is CriticalityLevel => {
  return ['1 (highest)', '2', '3', '4', '5 (lowest)'].includes(value);
};

export const getSafeCriticality = (value: string): CriticalityLevel => {
  return isCriticalityLevel(value) ? value : '5 (lowest)';
};