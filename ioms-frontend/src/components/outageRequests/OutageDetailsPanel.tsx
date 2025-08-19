// src/components/outageRequests/OutageDetailsPanel.tsx
import { useState, useEffect } from 'react';
import type { Outage } from '../../types/outage';
import CriticalityBadge from './CriticalityBadge';
import ApprovalActions from './ApprovalActions';
import OutageHistoryPanel from './OutageHistoryPanel';
import { useOutagesAdvanced } from '../../hooks/useOutagesAdvanced';

interface OutageDetailsPanelProps {
  outageId: string;
  userRole?: 'dev' | 'key_user' | 'admin';
}

export default function OutageDetailsPanel({ outageId, userRole }: OutageDetailsPanelProps) {
  const { getOutageById, isLoading } = useOutagesAdvanced();
  const [outage, setOutage] = useState<Outage | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'workflow'>('details');

  useEffect(() => {
    const loadOutage = async () => {
      try {
        const outageData = await getOutageById(outageId);
        setOutage(outageData);
      } catch (error) {
        console.error('Error loading outage:', error);
      }
    };

    loadOutage();
  }, [outageId, getOutageById]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading outage details...</p>
      </div>
    );
  }

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
          <ApprovalActions outageId={outageId} outage={outage} />
        </div>
      )}

      {/* Abas para diferentes seções */}
      <div className="pt-6 border-t">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'workflow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Workflow
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Detalhes existentes */}
            </div>
          )}
          
          {activeTab === 'history' && (
            <OutageHistoryPanel outageId={outageId} />
          )}
          
          {activeTab === 'workflow' && (
            <div className="text-center py-8 text-gray-500">
              Workflow information will be displayed here
            </div>
          )}
        </div>
      </div>
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