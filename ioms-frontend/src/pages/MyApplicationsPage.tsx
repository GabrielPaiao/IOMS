import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, Plus, Eye, PencilSimple, X, Check, ClipboardText, Trash } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { applicationsService } from '../services/applications.service';
import { usersService } from '../services/users.service';

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingEnvironments, setEditingEnvironments] = useState<{ [key: number]: boolean }>({});
  const [editingKeyUsers, setEditingKeyUsers] = useState<{ [key: number]: boolean }>({});
  const [editingData, setEditingData] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    loadApplications();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [applications, searchTerm]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const data = await usersService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Erro ao carregar aplicações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const startEditingEnvironments = (appId: number) => {
    const app = applications.find(a => a.id === appId);
    const environments = app?.environments?.map((env: any) => ({ 
      name: env.environment || env.name || '', 
      environment: env.environment || env.name || '',
      description: env.description || '' 
    })) || [];
    
    setEditingData({
      ...editingData,
      [appId]: {
        ...editingData[appId],
        environments
      }
    });
    setEditingEnvironments({ ...editingEnvironments, [appId]: true });
  };

  const startEditingKeyUsers = (appId: number) => {
    const app = applications.find(a => a.id === appId);
    setEditingData({
      ...editingData,
      [appId]: {
        ...editingData[appId],
        keyUsers: app?.keyUsers?.map((user: any) => ({ ...user })) || []
      }
    });
    setEditingKeyUsers({ ...editingKeyUsers, [appId]: true });
  };

  const saveEnvironments = async (appId: number) => {
    try {
      const environments = editingData[appId]?.environments || [];
      // Convert to the format expected by the backend
      const environmentsForUpdate = environments.map((env: any) => env.name || env.environment);
      
      await applicationsService.updateApplication(appId.toString(), {
        environments: environmentsForUpdate
      });
      await loadApplications();
      setEditingEnvironments({ ...editingEnvironments, [appId]: false });
      setEditingData({ ...editingData, [appId]: { ...editingData[appId], environments: undefined } });
    } catch (error) {
      console.error('Erro ao salvar ambientes:', error);
      alert('Erro ao salvar ambientes. Tente novamente.');
    }
  };

  const saveKeyUsers = async (appId: number) => {
    try {
      const keyUsers = editingData[appId]?.keyUsers || [];
      // Extract user IDs for the backend
      const keyUserEmails = keyUsers.map((ku: any) => ku.user.email);
      await applicationsService.updateApplication(appId.toString(), {
        keyUsers: keyUserEmails
      });
      await loadApplications();
      setEditingKeyUsers({ ...editingKeyUsers, [appId]: false });
      setEditingData({ ...editingData, [appId]: { ...editingData[appId], keyUsers: undefined } });
    } catch (error) {
      console.error('Erro ao salvar key users:', error);
    }
  };

  const cancelEditingEnvironments = (appId: number) => {
    setEditingEnvironments({ ...editingEnvironments, [appId]: false });
    setEditingData({ ...editingData, [appId]: { ...editingData[appId], environments: undefined } });
  };

  const cancelEditingKeyUsers = (appId: number) => {
    setEditingKeyUsers({ ...editingKeyUsers, [appId]: false });
    setEditingData({ ...editingData, [appId]: { ...editingData[appId], keyUsers: undefined } });
  };

  const updateEnvironment = (appId: number, index: number, field: string, value: string) => {
    const environments = [...(editingData[appId]?.environments || [])];
    if (field === 'name') {
      environments[index] = { ...environments[index], name: value, environment: value };
    } else {
      environments[index] = { ...environments[index], [field]: value };
    }
    setEditingData({
      ...editingData,
      [appId]: { ...editingData[appId], environments }
    });
  };

  const addEnvironment = (appId: number) => {
    const environments = [...(editingData[appId]?.environments || [])];
    environments.push({ name: '', environment: '', description: '' });
    setEditingData({
      ...editingData,
      [appId]: { ...editingData[appId], environments }
    });
  };

  const removeEnvironment = (appId: number, index: number) => {
    const environments = [...(editingData[appId]?.environments || [])];
    environments.splice(index, 1);
    setEditingData({
      ...editingData,
      [appId]: { ...editingData[appId], environments }
    });
  };

  const addKeyUser = async (appId: number, email: string) => {
    if (!email || !email.includes('@')) {
      alert('Email inválido');
      return;
    }
    
    try {
      const keyUsers = [...(editingData[appId]?.keyUsers || [])];
      if (keyUsers.some(ku => ku.user.email === email)) {
        alert('Usuário já é key user desta aplicação');
        return;
      }

      // For now, we'll add the user with minimal info and let the backend validate
      keyUsers.push({ user: { email, name: email } });
      setEditingData({
        ...editingData,
        [appId]: { ...editingData[appId], keyUsers }
      });
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      alert('Erro ao adicionar usuário');
    }
  };

  const removeKeyUser = (appId: number, index: number) => {
    const keyUsers = [...(editingData[appId]?.keyUsers || [])];
    keyUsers.splice(index, 1);
    setEditingData({
      ...editingData,
      [appId]: { ...editingData[appId], keyUsers }
    });
  };

  const handleDeleteApplication = async (appId: number, appName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a aplicação "${appName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await applicationsService.deleteApplication(appId.toString());
      alert('Aplicação excluída com sucesso!');
      loadApplications(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao excluir aplicação:', error);
      alert('Erro ao excluir aplicação. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando aplicações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minhas Aplicações</h1>
              <p className="mt-2 text-gray-600">
                Gerencie suas aplicações do sistema IOMS
              </p>
            </div>
            <button
              onClick={() => navigate('/applications/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus size={20} className="mr-2" />
              Nova Aplicação
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlass size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma aplicação encontrada' : 'Nenhuma aplicação encontrada'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Tente ajustar os termos de busca ou limpar os filtros.'
                : 'Você não possui aplicações registradas no sistema.'
              }
            </p>
            <button
              onClick={() => navigate('/applications/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={20} className="mr-2" />
              Criar primeira aplicação
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{app.name}</h3>
                    <p className="text-gray-600 mb-4">{app.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye size={16} className="mr-1" />
                      Visualizar
                    </button>
                    <button
                      onClick={() => navigate(`/applications/${app.id}/edit`)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <PencilSimple size={16} className="mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteApplication(app.id, app.name)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash size={16} className="mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Environments */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900">Ambientes</h4>
                      {!editingEnvironments[app.id] && (
                        <button
                          onClick={() => startEditingEnvironments(app.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                    
                    {editingEnvironments[app.id] ? (
                      <div className="space-y-3">
                        {(editingData[app.id]?.environments || []).map((env: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Nome"
                              value={env.name || env.environment || ''}
                              onChange={(e) => updateEnvironment(app.id, index, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Descrição"
                              value={env.description || ''}
                              onChange={(e) => updateEnvironment(app.id, index, 'description', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                              onClick={() => removeEnvironment(app.id, index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => addEnvironment(app.id)}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            + Adicionar Ambiente
                          </button>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => saveEnvironments(app.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm text-white bg-green-600 hover:bg-green-700"
                          >
                            <Check size={16} className="mr-1" />
                            Salvar
                          </button>
                          <button
                            onClick={() => cancelEditingEnvironments(app.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <X size={16} className="mr-1" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {app.environments?.map((env: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            <div className="font-medium text-gray-900">{env.environment || env.name}</div>
                            {env.description && (
                              <div className="text-sm text-gray-600 mt-1">{env.description}</div>
                            )}
                          </div>
                        ))}
                        {(!app.environments || app.environments.length === 0) && (
                          <p className="text-gray-500 text-sm italic">Nenhum ambiente configurado</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Key Users */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900">Key Users</h4>
                      {!editingKeyUsers[app.id] && (
                        <button
                          onClick={() => startEditingKeyUsers(app.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                    
                    {editingKeyUsers[app.id] ? (
                      <div className="space-y-3">
                        {(editingData[app.id]?.keyUsers || []).map((keyUser: any, index: number) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div>
                              <div className="font-medium text-gray-900">{keyUser.first_name} {keyUser.last_name}</div>
                              <div className="text-sm text-gray-600">{keyUser.email}</div>
                            </div>
                            <button
                              onClick={() => removeKeyUser(app.id, index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <div className="flex space-x-2">
                          <input
                            type="email"
                            placeholder="Email do usuário"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addKeyUser(app.id, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                              if (input) {
                                addKeyUser(app.id, input.value);
                                input.value = '';
                              }
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-700 px-3 py-2 border border-gray-300 rounded-md"
                          >
                            Adicionar
                          </button>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => saveKeyUsers(app.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm text-white bg-green-600 hover:bg-green-700"
                          >
                            <Check size={16} className="mr-1" />
                            Salvar
                          </button>
                          <button
                            onClick={() => cancelEditingKeyUsers(app.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <X size={16} className="mr-1" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {app.keyUsers?.map((keyUser: any) => (
                          <div key={keyUser.keyuser_id} className="bg-gray-50 rounded-lg p-3">
                            <div className="font-medium text-gray-900">{keyUser.first_name} {keyUser.last_name}</div>
                            <div className="text-sm text-gray-600">{keyUser.email}</div>
                          </div>
                        ))}
                        {(!app.keyUsers || app.keyUsers.length === 0) && (
                          <p className="text-gray-500 text-sm italic">Nenhum key user configurado</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
