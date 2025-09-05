// src/pages/OutageDetailsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOutagesAdvanced } from '../hooks/useOutagesAdvanced';
import {
  ArrowLeft, 
  ProhibitInset as Cancel,
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  ClockCounterClockwise,
  User,
  PencilSimple as Edit,
  Trash
} from '@phosphor-icons/react';
import CriticalityBadge from '../components/outageRequests/CriticalityBadge';
import ApprovalActions from '../components/outageRequests/ApprovalActions';
import OutageHistoryPanel from '../components/outageRequests/OutageHistoryPanel';

export default function OutageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getOutageById, 
    getChangeHistory,
    cancelOutage,
    isLoading, 
    error,
    clearError 
  } = useOutagesAdvanced();

  const [outage, setOutage] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [isLoadingOutage, setIsLoadingOutage] = useState(false);


  useEffect(() => {
    if (id) {
      loadOutage();
      loadHistory();
    }
  }, [id]);

  const loadOutage = async () => {
    if (!id) return;

    setIsLoadingOutage(true);
    try {
      const outageData = await getOutageById(id);
      setOutage(outageData);
    } catch (err) {
      console.error('Error loading outage:', err);
    } finally {
      setIsLoadingOutage(false);
    }
  };

  const loadHistory = async () => {
    if (!id) return;
    
    try {
      // History is now loaded directly by OutageHistoryPanel component
      await getChangeHistory(id);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const handleEdit = () => {
    navigate(`/outages/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this outage? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implementar delete da outage
      navigate('/outages');
    } catch (err) {
      console.error('Error deleting outage:', err);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this outage? This action cannot be undone.')) {
      return;
    }

    const reason = prompt('Please inform the cancellation reason (optional):');
    
    try {
      const cancelled = await cancelOutage(id!, reason || undefined);
      setOutage(cancelled);
      alert('Outage cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling outage:', err);
      alert('Error cancelling outage. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <XCircle className="h-5 w-5" />;
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'cancelled': return <ClockCounterClockwise className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const canEdit = () => {
    if (!outage || !user) return false;
    
    // User can edit if:
    // 1. Is the creator of the outage
    // 2. Is admin or key user
    // 3. The outage is still pending
    return (
      outage.createdBy === user.id ||
      ['ADMIN', 'KEY_USER'].includes(user.role) ||
      outage.status === 'pending'
    );
  };

  const canDelete = () => {
    if (!outage || !user) return false;
    
    // Apenas admin pode deletar
    return user.role?.toUpperCase() === 'ADMIN';
  };

  const canCancel = () => {
    if (!outage || !user) return false;
    
    // Apenas admin pode cancelar
    // And the outage cannot already be cancelled or completed
    return (
      user.role?.toUpperCase() === 'ADMIN' &&
      !['CANCELLED', 'COMPLETED'].includes(outage.status?.toUpperCase())
    );
  };

  if (isLoading || isLoadingOutage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar outage</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              clearError();
              loadOutage();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!outage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Outage not found</h2>
          <p className="text-gray-600">The requested outage does not exist or has been removed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Outage Details
              </h1>
              <p className="text-gray-600">
                {outage.reason}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {canEdit() && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              )}

              {canCancel() && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-orange-300 text-orange-700 rounded-md hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center"
                >
                  <Cancel className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              )}
              
              {canDelete() && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status and Criticality */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <CriticalityBadge criticality={outage.criticality} />
              
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(outage.status)}`}>
                {getStatusIcon(outage.status)}
                <span className="ml-2 capitalize">{outage.status}</span>
              </span>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Created on</p>
              <p className="text-gray-900 font-medium">{formatDate(outage.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Details
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                History
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'details' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Outage Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Reason
                        </label>
                        <p className="text-gray-900 font-medium">{outage.reason}</p>
                      </div>
                      
                      {outage.description && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Description
                          </label>
                          <p className="text-gray-900">{outage.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Application
                        </label>
                        <p className="text-gray-900">
                          {outage.application ? outage.application.name : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates and Times */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Dates and Times
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Start:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(outage.scheduledStart)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">End:</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(outage.scheduledEnd)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Estimated Duration:</span>
                        <span className="font-medium text-gray-900">
                          {formatDuration(outage.estimatedDuration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  {/* User */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-green-600" />
                      User
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Created by:</span>
                        <span className="font-medium text-gray-900">
                          {outage.createdByUser ? 
                            `${outage.createdByUser.firstName} ${outage.createdByUser.lastName}` : 
                            'N/A'
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">
                          {outage.createdByUser ? outage.createdByUser.email : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  {(outage.status === 'pending' || outage.status === 'PENDING') && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Approval Actions
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">Debug: Status = "{outage.status}"</p>
                      <ApprovalActions outageId={outage.id} outage={outage} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              <OutageHistoryPanel outageId={outage.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}