// src/components/outageRequests/OutageDetailsPanel.tsx
import type { Outage } from '../../types/outage';
import { outageDetailsMock } from '../../mocks/dataMocks';
import CriticalityBadge from './CriticalityBadge';
import ApprovalActions from './ApprovalActions';

interface OutageDetailsPanelProps {
  outageId: string;
  userRole?: 'dev' | 'key_user' | 'admin';
}

export default function OutageDetailsPanel({ outageId, userRole }: OutageDetailsPanelProps) {
  const outage = outageDetailsMock.find(o => o.id === outageId);

  if (!outage) {
    return (
      <div className="text-center py-12 text-gray-500">
        Outage not found or no longer available
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho atualizado para mostrar o título */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {outage.title || outage.application} {/* Mostra título ou fallback */}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          ID: {outage.id} • {outage.environment.join(', ')} environment(s)
        </p>
      </div>

      {/* Detalhes */}
      <div className="space-y-4">
        <DetailItem 
          label="Scheduled by" 
          value={outage.requester.split('@')[0]} 
        />
        
        <DetailItem 
          label="Request raised" 
          value={formatDateTime(outage.createdAt || outage.start)} 
        />
        
        {outage.status !== 'pending' && (
          <DetailItem 
            label="Request approved" 
            value={outage.approvedAt ? formatDateTime(outage.approvedAt) : 'N/A'} 
          />
        )}
        
        <DetailItem 
          label="Outage Window" 
          value={`${formatDateTime(outage.start)} - ${formatDateTime(outage.end)}`} 
        />
        
        <DetailItem 
          label="Environment(s)" 
          value={outage.environment.join(', ')} 
        />
        
        <DetailItem 
          label="Site" 
          value={`${outage.location} (${outage.locationCode || 'N/A'})`} 
        />
        
        <DetailItem 
          label="Criticality" 
          value={<CriticalityBadge criticality={outage.criticality} />} 
        />
        
        <DetailItem 
          label="Reason" 
          value={
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-800">{outage.reason}</p>
            </div>
          } 
        />
      </div>

      {/* Ações para Key User */}
      {userRole === 'key_user' && outage.status === 'pending' && (
        <div className="pt-6">
          <ApprovalActions outageId={outageId} />
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para detalhes
function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <div className="text-gray-800">
        {value}
      </div>
    </div>
  );
}