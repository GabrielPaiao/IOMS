// src/pages/OutageRequestsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOutagesAdvanced } from '../hooks/useOutagesAdvanced';
import { 
  Plus, 
  Funnel as Filter, 
  MagnifyingGlass as Search, 
  Calendar, 
  Clock, 
  Warning,
  CheckCircle,
  XCircle,
  ClockCounterClockwise,
  Eye
} from '@phosphor-icons/react';
import CriticalityBadge from '../components/outageRequests/CriticalityBadge';

export default function OutageRequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    outages, 
    loadOutages, 
    loadPendingApproval,
    approveOutage,
    rejectOutage,
    isLoading, 
    error,
    clearError 
  } = useOutagesAdvanced();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'my'>('all');
  const [filters, setFilters] = useState({
    status: '',
    criticality: '',
    applicationId: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      loadOutages();
    }
  }, [user?.companyId, loadOutages]);

  const handleTabChange = (tab: 'all' | 'pending' | 'my') => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'all':
        loadOutages(filters);
        break;
      case 'pending':
        loadPendingApproval();
        break;
      case 'my':
        // TODO: Implementar carregamento de minhas outages
        loadOutages({ ...filters, createdBy: user?.id });
        break;
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (activeTab === 'all') {
      loadOutages(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: '',
      criticality: '',
      applicationId: '',
      search: ''
    };
    setFilters(clearedFilters);
    loadOutages();
  };

  const handleApprove = async (outageId: string) => {
    try {
      await approveOutage(outageId, 'Approved via web interface');
      // Recarregar a lista pendente
      if (activeTab === 'pending') {
        loadPendingApproval();
      }
    } catch (error) {
      console.error('Error approving outage:', error);
    }
  };

  const handleReject = async (outageId: string) => {
    const reason = prompt('Rejection reason:');
    if (reason) {
      try {
        await rejectOutage(outageId, reason);
        // Recarregar a lista pendente
        if (activeTab === 'pending') {
          loadPendingApproval();
        }
      } catch (error) {
        console.error('Error rejecting outage:', error);
      }
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
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <ClockCounterClockwise className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  if (isLoading) {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error loading outages</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              clearError();
              loadOutages();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Outage Requests
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and track all outage requests
              </p>
            </div>
            
            {user?.role !== 'admin' && (
              <button
                onClick={() => navigate('/outages/new')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Outage
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Outages
              </button>
              
              <button
                onClick={() => handleTabChange('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Approval
              </button>
              
              <button
                onClick={() => handleTabChange('my')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Outages
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </h3>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criticality
                </label>
                <select
                  value={filters.criticality}
                  onChange={(e) => handleFilterChange('criticality', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Criticalities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search by reason..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Outages */}
        <div className="bg-white rounded-lg shadow-sm">
          {outages.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {outages.map((outage: any) => (
                <div key={outage.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <CriticalityBadge criticality={outage.criticality} />
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(outage.status)}`}>
                          {getStatusIcon(outage.status)}
                          <span className="ml-1 capitalize">{outage.status}</span>
                        </span>
                        
                        {outage.application && (
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {outage.application.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {outage.reason}
                      </h3>

                      {outage.description && (
                        <p className="text-gray-600 mb-3">
                          {outage.description}
                        </p>
                      )}

                      <div className="flex items-center text-sm text-gray-500 space-x-6">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(outage.scheduledStart)} - {formatDate(outage.scheduledEnd)}
                        </span>
                        
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(outage.estimatedDuration)}
                        </span>
                        
                        {outage.createdByUser && (
                          <span className="flex items-center">
                            <Warning className="h-4 w-4 mr-1" />
                            {outage.createdByUser.firstName} {outage.createdByUser.lastName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/outages/${outage.id}`)}
                        className="px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      
                      {/* Botões de aprovação apenas para Key Users e Admins na aba pending */}
                      {activeTab === 'pending' && (user?.role === 'key_user' || user?.role === 'admin') && outage.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(outage.id)}
                            className="px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          
                          <button
                            onClick={() => handleReject(outage.id)}
                            className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No outages found
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'all' && 'There are no outages registered in the system.'}
                {activeTab === 'pending' && 'There are no outages pending approval.'}
                {activeTab === 'my' && 'You have no registered outages.'}
              </p>
              
              {activeTab === 'all' && user?.role !== 'admin' && (
                <button
                  onClick={() => navigate('/outages/new')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center mx-auto"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Outage
                </button>
              )}
            </div>
          )}
        </div>

        {/* Paginação (placeholder para implementação futura) */}
        {outages.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{outages.length}</span> of{' '}
                <span className="font-medium">{outages.length}</span> results
              </p>
              
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <span className="px-3 py-2 text-gray-700">1</span>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}