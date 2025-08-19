// src/components/outageRequests/ApprovalActions.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutagesAdvanced } from '../../hooks/useOutagesAdvanced';
import type { Outage } from '../../types/outage';

interface ApprovalActionsProps {
  outageId: string;
  outage: Outage;
  onStatusChange?: (newStatus: 'approved' | 'rejected') => void;
}

export default function ApprovalActions({ 
  outageId,
  outage,
  onStatusChange 
}: ApprovalActionsProps) {
  const navigate = useNavigate();
  const { approveOutage, rejectOutage, isLoading } = useOutagesAdvanced();
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');

  const handleAction = (actionType: 'approve' | 'reject') => {
    setAction(actionType);
    setShowReasonDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!action || !reason) return;

    try {
      if (action === 'approve') {
        await approveOutage(outageId, reason, comments);
      } else {
        await rejectOutage(outageId, reason, comments);
      }

      // Feedback visual
      alert(`${action === 'approve' ? 'Approved' : 'Rejected'} outage:
        \nApplication: ${outage.application}
        \nSite: ${outage.location}
        \nCriticality: ${outage.criticality}
        \nReason: ${outage.reason}`);

      // Atualização do estado global
      onStatusChange?.(action === 'approve' ? 'approved' : 'rejected');

      // Navegação com estado para recarregar
      navigate('/outage-requests', { 
        state: { 
          refreshed: true,
          action: `${action}d`,
          outageId 
        } 
      });
    } catch (error) {
      alert(`Error ${action === 'approve' ? 'approving' : 'rejecting'} outage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setShowReasonDialog(false);
      setAction(null);
      setReason('');
      setComments('');
    }
  };

  // Verifica se está pendente
  if (outage.status !== 'pending') {
    return (
      <div className="pt-6 mt-6 border-t">
        <p className="text-gray-500 text-sm">
          {outage.status === 'approved' ? '✓ Already approved' : 
           outage.status === 'rejected' ? '✗ Already rejected' : 
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
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>✓</span> {isLoading ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={() => handleAction('reject')}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>✗</span> {isLoading ? 'Processing...' : 'Reject'}
        </button>
      </div>

      {/* Dialog de confirmação */}
      {showReasonDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for action"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments (optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional comments"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReasonDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={!reason || isLoading}
                className={`px-4 py-2 rounded-md text-sm text-white ${
                  action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}