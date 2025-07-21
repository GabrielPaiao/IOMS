// src/components/outageRequests/OutageList.tsx
import type { Outage } from '../../types/outage';
import CriticalityBadge from './CriticalityBadge';

interface OutageListProps {
  onSelectOutage: (id: string) => void;
  selectedId: string | null;
  outages: Outage[];
  showLocation?: boolean;
}

export default function OutageList({ 
  onSelectOutage, 
  selectedId,
  outages,
  showLocation = true
}: OutageListProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-3">
      {outages.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No outages found matching your criteria
        </div>
      ) : (
        outages.map((outage) => (
          <div
            key={outage.id}
            onClick={() => onSelectOutage(outage.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedId === outage.id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            data-testid={`outage-item-${outage.id}`}
          >
            <div className="space-y-2">
              {/* Título e Criticality */}
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800">
                  {outage.title || outage.application}
                </h3>
                <CriticalityBadge criticality={outage.criticality} />
              </div>
              
              {/* Período */}
              <p className="text-sm text-gray-600">
                {formatDateTime(outage.start)} - {formatDateTime(outage.end)}
              </p>
              
              {/* Localização e Ambiente */}
              {showLocation && (
                <div className="flex gap-2 text-sm text-gray-600">
                  <span>{outage.location}</span>
                  <span>•</span>
                  <span>
                    {Array.isArray(outage.environment) 
                      ? outage.environment.join(', ') 
                      : outage.environment}
                  </span>
                </div>
              )}
              
              {/* Status e Requester */}
              <div className="flex justify-between items-center pt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  outage.status === 'approved' ? 'bg-green-100 text-green-800' :
                  outage.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {outage.status.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500">
                  Requested by: {outage.requester.split('@')[0]}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}