import { useState, useEffect } from 'react';
import { useOutagesAdvanced } from '../../hooks/useOutagesAdvanced';
import type { OutageChangeHistory } from '../../types/outage';

interface OutageHistoryPanelProps {
  outageId: string;
}

export default function OutageHistoryPanel({ outageId }: OutageHistoryPanelProps) {
  const { getChangeHistory, isLoading } = useOutagesAdvanced();
  const [changeHistory, setChangeHistory] = useState<OutageChangeHistory[]>([]);
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'note' | 'feedback' | 'question'>('comment');

  useEffect(() => {
    loadChangeHistory();
  }, [outageId]);

  const loadChangeHistory = async () => {
    try {
      const history = await getChangeHistory(outageId);
      setChangeHistory(history);
    } catch (error) {
      console.error('Error loading change history:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // For now, we'll just show an alert since addComment is not available
      // In a real implementation, you would call the change history service directly
      alert('Comment functionality will be implemented soon');
      setNewComment('');
      setCommentType('comment');
      setShowAddComment(false);
    } catch (error) {
      alert(`Error adding comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatChangeType = (type: string) => {
    const typeMap: Record<string, string> = {
      'create': 'Created',
      'update': 'Updated',
      'status_change': 'Status Changed',
      'approval': 'Approved',
      'rejection': 'Rejected',
      'cancellation': 'Cancelled',
      'comment': 'Comment Added',
      'note': 'Note Added',
      'feedback': 'Feedback Added',
      'question': 'Question Added'
    };
    return typeMap[type] || type;
  };

  const formatFieldName = (field: string) => {
    const fieldMap: Record<string, string> = {
      'title': 'Title',
      'description': 'Description',
      'criticality': 'Criticality',
      'status': 'Status',
      'reason': 'Reason',
      'start': 'Start Time',
      'end': 'End Time',
      'applicationId': 'Application',
      'locationId': 'Location',
      'environmentIds': 'Environments',
      'comment': 'Comment'
    };
    return fieldMap[field] || field;
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'create': return '🆕';
      case 'update': return '✏️';
      case 'status_change': return '🔄';
      case 'approval': return '✅';
      case 'rejection': return '❌';
      case 'cancellation': return '🚫';
      case 'comment': return '💬';
      case 'note': return '📝';
      case 'feedback': return '💭';
      case 'question': return '❓';
      default: return '📋';
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'create': return 'text-green-600';
      case 'update': return 'text-blue-600';
      case 'status_change': return 'text-yellow-600';
      case 'approval': return 'text-green-600';
      case 'rejection': return 'text-red-600';
      case 'cancellation': return 'text-red-600';
      case 'comment': return 'text-gray-600';
      case 'note': return 'text-purple-600';
      case 'feedback': return 'text-indigo-600';
      case 'question': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="pt-6 mt-6 border-t">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 mt-6 border-t">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Change History</h3>
        <button
          onClick={() => setShowAddComment(true)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Add Comment
        </button>
      </div>

      {changeHistory.length === 0 ? (
        <p className="text-gray-500 text-sm">No changes recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {changeHistory.map((change: OutageChangeHistory) => (
            <div key={change.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${getChangeColor(change.changeType)}`}>
                  {getChangeIcon(change.changeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {formatChangeType(change.changeType)}
                    </span>
                    {change.field !== 'comment' && (
                      <span className="text-sm text-gray-500">
                        • {formatFieldName(change.field)}
                      </span>
                    )}
                  </div>
                  
                  {change.field !== 'comment' && change.oldValue && change.newValue && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="line-through">{change.oldValue}</span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">{change.newValue}</span>
                    </div>
                  )}
                  
                  {change.field === 'comment' && (
                    <div className="text-sm text-gray-700 mb-2">
                      {change.newValue}
                    </div>
                  )}
                  
                  {change.reason && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Reason:</span> {change.reason}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>By {change.changedBy}</span>
                    <span>•</span>
                    <span>{new Date(change.changedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog para adicionar comentário */}
      {showAddComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Add Comment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment Type
                </label>
                <select
                  value={commentType}
                  onChange={(e) => setCommentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="comment">Comment</option>
                  <option value="note">Note</option>
                  <option value="feedback">Feedback</option>
                  <option value="question">Question</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment *
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your comment"
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddComment(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
