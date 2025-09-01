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
    'CRITICAL': 'bg-red-100 text-red-800 border-red-200',
    'HIGH': 'bg-orange-100 text-orange-800 border-orange-200',
    'MEDIUM': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'LOW': 'bg-green-100 text-green-800 border-green-200'
  };

  const labels: Record<CriticalityLevel, string> = {
    'CRITICAL': '1 (highest)',
    'HIGH': '2',
    'MEDIUM': '3', 
    'LOW': '4 (lowest)'
  };

  const safeCriticality = getSafeCriticality(criticality);

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${styles[safeCriticality]} ${className}`}>
      {labels[safeCriticality]}
    </span>
  );
}