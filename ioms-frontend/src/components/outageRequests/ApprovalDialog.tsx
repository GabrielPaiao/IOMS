// src/components/outageRequests/ApprovalDialog.tsx

interface ApprovalDialogProps {
  action: 'approve' | 'reject';
  onConfirm: (confirmed: boolean) => void;
  onClose: () => void;
}

export default function ApprovalDialog({ action, onConfirm, onClose }: ApprovalDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">
          Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
        </h3>
        <p className="mb-6">
          Are you sure you want to {action} this outage request?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onClose()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(true)}
            className={`px-4 py-2 rounded-md text-sm text-white ${
              action === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}