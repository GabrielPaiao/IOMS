// src/components/outageRequests/CriticalityBadge.tsx
import type { CriticalityLevel } from '../../types/outage';
import { getSafeCriticality } from '../../utils/typeGuards';

interface CriticalityBadgeProps {
  criticality: string; // Agora aceita string genérica
  className?: string;
  label?: string;
}

export default function CriticalityBadge({ 
  criticality, 
  className = '' 
}: CriticalityBadgeProps) {
  const styles: Record<CriticalityLevel, string> = {
    '1 (highest)': 'bg-red-100 text-red-800 border-red-200',
    '2': 'bg-orange-100 text-orange-800 border-orange-200',
    '3': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    '4': 'bg-blue-100 text-blue-800 border-blue-200',
    '5 (lowest)': 'bg-green-100 text-green-800 border-green-200'
  };

  const safeCriticality = getSafeCriticality(criticality);

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${styles[safeCriticality]} ${className}`}>
      {safeCriticality}
    </span>
  );
}