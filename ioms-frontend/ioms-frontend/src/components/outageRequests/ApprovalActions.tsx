// src/components/outageRequests/ApprovalActions.tsx
import { useNavigate } from 'react-router-dom';
import { outageDetailsMock } from '../../mocks/outageMocks';
import type { Outage } from '../../types/outage';

interface ApprovalActionsProps {
  outageId: string;
  onStatusChange?: (newStatus: 'approved' | 'rejected') => void;
}

export default function ApprovalActions({ 
  outageId,
  onStatusChange 
}: ApprovalActionsProps) {
  const navigate = useNavigate();

  const handleAction = (action: 'approve' | 'reject') => {
    // 1. Atualiza o mock localmente (simulação)
    const outageIndex = outageDetailsMock.findIndex(o => o.id === outageId);
    if (outageIndex >= 0) {
      const updatedOutage: Outage = {
        ...outageDetailsMock[outageIndex],
        status: action === 'approve' ? 'approved' : 'rejected',
        // Mantém todos os campos obrigatórios
        environment: outageDetailsMock[outageIndex].environment,
        reason: outageDetailsMock[outageIndex].reason
      };
      outageDetailsMock[outageIndex] = updatedOutage;
    }

    // 2. Feedback visual com detalhes da ação
    const outage = outageDetailsMock.find(o => o.id === outageId);
    alert(`${action === 'approve' ? 'Approved' : 'Rejected'} outage:
      \nApplication: ${outage?.application}
      \nSite: ${outage?.location}
      \nCriticality: ${outage?.criticality}
      \nReason: ${outage?.reason}`);

    // 3. Atualização do estado global (se necessário)
    onStatusChange?.(action === 'approve' ? 'approved' : 'rejected');

    // 4. Navegação com estado para recarregar
    navigate('/outage-requests', { 
      state: { 
        refreshed: true,
        action: `${action}d`,
        outageId 
      } 
    });
  };

  // Encontra a outage e verifica se está pendente
  const outage = outageDetailsMock.find(o => o.id === outageId);
  if (!outage || outage.status !== 'pending') {
    return (
      <div className="pt-6 mt-6 border-t">
        <p className="text-gray-500 text-sm">
          {outage?.status === 'approved' ? '✓ Already approved' : 
           outage?.status === 'rejected' ? '✗ Already rejected' : 
           'No pending actions'}
        </p>
      </div>
    );
  }

  // Componente visual para outages pendentes
  return (
    <div className="space-y-4 pt-6 mt-6 border-t">
      <div className="bg-yellow-50 p-3 rounded-lg">
        <h3 className="font-medium text-yellow-800">Review Details</h3>
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Criticality: <strong>{outage.criticality}</strong></li>
          <li>• Environment: <strong>{outage.environment}</strong></li>
          <li>• Reason: <em>"{outage.reason}"</em></li>
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleAction('approve')}
          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>✓</span> Approve
        </button>
        <button
          onClick={() => handleAction('reject')}
          className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>✗</span> Reject
        </button>
      </div>
    </div>
  );
}