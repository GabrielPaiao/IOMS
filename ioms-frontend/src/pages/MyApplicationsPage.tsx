// src/pages/MyApplicationsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOutagesAdvanced } from '../hooks/useOutagesAdvanced';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash, 
  Server, 
  MapPin, 
  Clock,
  Building,
  User
} from '@phosphor-icons/react';

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    applications, 
    loadApplications,
    isLoading, 
    error,
    clearError 
  } = useOutagesAdvanced();

  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    environment: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      loadApplications();
    }
  }, [user?.companyId, loadApplications]);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const applyFilters = () => {
    let filtered = [...applications];

    if (filters.search) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.environment) {
      filtered = filtered.filter(app => 
        app.environments.some((env: any) => env.environment === filters.environment)
      );
    }

    if (filters.location) {
      filtered = filtered.filter(app => 
        app.locations.some((loc: any) => loc.code === filters.location)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      environment: '',
      location: ''
    });
  };

  const handleViewApplication = (id: string) => {
    navigate(`/applications/${id}`);
  };

  const handleEditApplication = (id: string) => {
    navigate(`/applications/${id}/edit`);
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aplicação? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // TODO: Implementar delete da aplicação
      console.log('Deleting application:', id);
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'PRODUCTION': return 'text-red-600 bg-red-100';
      case 'STAGING': return 'text-orange-600 bg-orange-100';
      case 'DEVELOPMENT': return 'text-blue-600 bg-blue-100';
      case 'TESTING': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar aplicações</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              clearError();
              loadApplications();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
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
                Minhas Aplicações
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie e acompanhe todas as suas aplicações
              </p>
            </div>
            
            <button
              onClick={() => navigate('/applications/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Aplicação
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </h3>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Buscar por nome ou descrição..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ambiente
                </label>
                <select
                  value={filters.environment}
                  onChange={(e) => handleFilterChange('environment', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os Ambientes</option>
                  <option value="PRODUCTION">Produção</option>
                  <option value="STAGING">Staging</option>
                  <option value="DEVELOPMENT">Desenvolvimento</option>
                  <option value="TESTING">Teste</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Aplicações */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredApplications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {app.name}
                        </h3>
                        
                        {app.version && (
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            v{app.version}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4">
                        {app.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Ambientes */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Server className="h-4 w-4 mr-1" />
                            Ambientes
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {app.environments && app.environments.length > 0 ? (
                              app.environments.map((env: any, index: number) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEnvironmentColor(env.environment)}`}
                                >
                                  {env.environment}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">Nenhum ambiente configurado</span>
                            )}
                          </div>
                        </div>

                        {/* Localizações */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            Localizações
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {app.locations && app.locations.length > 0 ? (
                              app.locations.map((loc: any, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100"
                                >
                                  {loc.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">Nenhuma localização configurada</span>
                            )}
                          </div>
                        </div>

                        {/* Estatísticas */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Estatísticas
                          </h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Outages:</span>
                              <span className="font-medium text-gray-900">
                                {app._count?.outages || 0}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Criado em:</span>
                              <span className="font-medium text-gray-900">
                                {new Date(app.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Informações Adicionais */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        {app.technology && (
                          <span className="flex items-center">
                            <Server className="h-4 w-4 mr-1" />
                            {app.technology}
                          </span>
                        )}
                        
                        {app.owner && (
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {app.owner}
                          </span>
                        )}
                        
                        {app.createdByUser && (
                          <span className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {app.createdByUser.firstName} {app.createdByUser.lastName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => handleViewApplication(app.id)}
                        className="px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </button>
                      
                      <button
                        onClick={() => handleEditApplication(app.id)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma aplicação encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.environment || filters.location
                  ? 'Nenhuma aplicação corresponde aos filtros aplicados.'
                  : 'Você não possui aplicações registradas no sistema.'
                }
              </p>
              
              {!filters.search && !filters.environment && !filters.location && (
                <button
                  onClick={() => navigate('/applications/new')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center mx-auto"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeira Aplicação
                </button>
              )}
            </div>
          )}
        </div>

        {/* Paginação (placeholder para implementação futura) */}
        {filteredApplications.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{filteredApplications.length}</span> de{' '}
                <span className="font-medium">{applications.length}</span> aplicações
              </p>
              
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Anterior
                </button>
                <span className="px-3 py-2 text-gray-700">1</span>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}