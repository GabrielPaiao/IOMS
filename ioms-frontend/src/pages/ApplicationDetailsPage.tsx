import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOutagesAdvanced } from '../hooks/useOutagesAdvanced';
import applicationsService from '../services/applications.service';
import { 
  ArrowLeft, 
  PencilSimple as Edit, 
  Trash, 
  Plus, 
  Calendar, 
  MapPin, 
  Desktop as Server, 
  Clock,
  ClockCounterClockwise,
  Users
} from '@phosphor-icons/react';

export default function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getApplicationById,
    isLoading, 
    error,
    clearError 
  } = useOutagesAdvanced();
  
  // Verificar se usuário é ADMIN
  const isAdmin = () => {
    return user?.role?.toUpperCase() === 'ADMIN';
  };

  const [application, setApplication] = useState<any>(null);
  const [recentOutages, setRecentOutages] = useState<any[]>([]);
  const [isLoadingApp, setIsLoadingApp] = useState(false);


  useEffect(() => {
    if (id && id !== 'new') {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    if (!id) return;

    setIsLoadingApp(true);
    try {
      const appData = await getApplicationById(id);
      setApplication(appData);
      
      // TODO: Load recent outages from separate API call
      // For now, we'll leave recent outages empty
      setRecentOutages([]);
    } catch (err) {
      console.error('Error loading application:', err);
    } finally {
      setIsLoadingApp(false);
    }
  };

  const handleEdit = () => {
    navigate(`/applications/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta aplicação? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await applicationsService.deleteApplication(id!);
      alert('Aplicação excluída com sucesso!');
      navigate('/applications');
    } catch (err) {
      console.error('Error deleting application:', err);
      alert('Erro ao excluir aplicação. Tente novamente.');
    }
  };

  const handleNewOutage = () => {
    navigate('/outages/new', { 
      state: { 
        applicationId: id,
        applicationName: application?.name 
      } 
    });
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (isLoading || isLoadingApp) {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar aplicação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              clearError();
              loadApplication();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aplicação não encontrada</h2>
          <p className="text-gray-600">A aplicação solicitada não existe ou foi removida</p>
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
            Voltar
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {application.name}
              </h1>
              <p className="text-gray-600 mt-2">
                {application.description}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {user?.role !== 'admin' && (
                <button
                  onClick={handleNewOutage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Outage
                </button>
              )}
              
              {isAdmin() && (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalhes da Aplicação */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detalhes da Aplicação
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nome
                  </label>
                  <p className="text-gray-900 font-medium">{application.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Versão
                  </label>
                  <p className="text-gray-900">{application.version || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Criado em
                  </label>
                  <p className="text-gray-900">{formatDate(application.createdAt)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Criado por
                  </label>
                  <p className="text-gray-900">
                    {application.createdByUser ? 
                      `${application.createdByUser.firstName} ${application.createdByUser.lastName}` : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Key Users */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Key Users
              </h2>
              
              {application.keyUsers && application.keyUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.keyUsers.map((keyUser: any) => (
                    <div key={keyUser.keyuser_id} className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                          {keyUser.first_name ? keyUser.first_name[0] : keyUser.email[0].toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-indigo-900 font-medium">
                            {keyUser.first_name && keyUser.last_name 
                              ? `${keyUser.first_name} ${keyUser.last_name}` 
                              : keyUser.email
                            }
                          </p>
                          <p className="text-indigo-600 text-sm">{keyUser.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum key user configurado</p>
              )}
            </div>

            {/* Ambientes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Server className="h-5 w-5 mr-2 text-blue-600" />
                Ambientes
              </h2>
              
              {application.environments && application.environments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {application.environments.map((env: any, index: number) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-center">
                      <span className="text-blue-800 font-medium">{env.environment}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum ambiente configurado</p>
              )}
            </div>

            {/* Localizações */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Localizações
              </h2>
              
              {application.locations && application.locations.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {application.locations.map((loc: any, index: number) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-center">
                      <span className="text-green-800 font-medium">{loc.name}</span>
                      <p className="text-xs text-green-600 mt-1">{loc.code}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma localização configurada</p>
              )}
            </div>

            {/* Outages Recentes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ClockCounterClockwise className="h-5 w-5 mr-2 text-purple-600" />
                Outages Recentes
              </h2>
              
              {recentOutages.length > 0 ? (
                <div className="space-y-4">
                  {recentOutages.map((outage: any) => (
                    <div key={outage.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(outage.criticality)}`}>
                            {outage.criticality}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(outage.status)}`}>
                            {outage.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(outage.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 font-medium mb-2">
                        {outage.reason}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(outage.scheduledStart)} - {formatDate(outage.scheduledEnd)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(outage.estimatedDuration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma outage registrada</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estatísticas
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Outages</span>
                  <span className="text-lg font-bold text-blue-600">
                    {application._count?.outages || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Key Users</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {application.keyUsers?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ambientes</span>
                  <span className="text-lg font-bold text-green-600">
                    {application.environments?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Localizações</span>
                  <span className="text-lg font-bold text-purple-600">
                    {application.locations?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              
              <div className="space-y-3">
                {user?.role !== 'admin' && (
                  <button
                    onClick={handleNewOutage}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Outage
                  </button>
                )}
                
                {isAdmin() && (
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Aplicação
                  </button>
                )}
                
                <button
                  onClick={() => navigate(`/applications/${id}/outages`)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                >
                  <ClockCounterClockwise className="h-4 w-4 mr-2" />
                  Ver Todas as Outages
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}