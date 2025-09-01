import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Plus } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import applicationsService from '../services/applications.service';

export default function EditApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Verificar se usuário é ADMIN
  useEffect(() => {
    if (user && user.role?.toUpperCase() !== 'ADMIN') {
      alert('Acesso negado. Apenas administradores podem editar aplicações.');
      navigate('/applications');
    }
  }, [user, navigate]);
  
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    environments: [] as string[],
    keyUsers: [] as string[],
    newEnvironment: '',
    newKeyUser: ''
  });

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const app = await applicationsService.getApplicationById(id);
      
      setApplication(app);
      setFormData({
        name: app.name || '',
        description: app.description || '',
        environments: app.environments?.map((env: any) => env.environment || env) || [],
        keyUsers: (app as any).keyUsers?.map((ku: any) => ku.user?.email || ku.email || ku) || [],
        newEnvironment: '',
        newKeyUser: ''
      });
    } catch (err) {
      console.error('Error loading application:', err);
      setError('Erro ao carregar aplicação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      await applicationsService.updateApplication(id, {
        name: formData.name,
        description: formData.description,
        environments: formData.environments,
        keyUsers: formData.keyUsers
      });
      
      // Navegar de volta para My Applications
      navigate('/applications');
    } catch (err) {
      console.error('Error saving application:', err);
      setError('Erro ao salvar aplicação');
    } finally {
      setIsSaving(false);
    }
  };

  const addEnvironment = () => {
    if (formData.newEnvironment.trim() && !formData.environments.includes(formData.newEnvironment.trim())) {
      setFormData({
        ...formData,
        environments: [...formData.environments, formData.newEnvironment.trim()],
        newEnvironment: ''
      });
    }
  };

  const removeEnvironment = (env: string) => {
    setFormData({
      ...formData,
      environments: formData.environments.filter(e => e !== env)
    });
  };

  const addKeyUser = () => {
    if (formData.newKeyUser.trim() && !formData.keyUsers.includes(formData.newKeyUser.trim())) {
      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.newKeyUser.trim())) {
        setError('Por favor, insira um email válido');
        return;
      }
      
      setFormData({
        ...formData,
        keyUsers: [...formData.keyUsers, formData.newKeyUser.trim()],
        newKeyUser: ''
      });
      setError(null);
    }
  };

  const removeKeyUser = (email: string) => {
    setFormData({
      ...formData,
      keyUsers: formData.keyUsers.filter(u => u !== email)
    });
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/applications')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/applications')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar para Aplicações
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Aplicação: {application?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Edite as informações da aplicação
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Aplicação
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da aplicação"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição da aplicação"
              />
            </div>

            {/* Ambientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ambientes
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.environments.map((env, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-800 bg-blue-100"
                    >
                      {env}
                      <button
                        onClick={() => removeEnvironment(env)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newEnvironment}
                    onChange={(e) => setFormData({...formData, newEnvironment: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && addEnvironment()}
                    placeholder="Nome do ambiente (ex: PRD, HML)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addEnvironment}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Key Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Users
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.keyUsers.map((email, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-purple-800 bg-purple-100"
                    >
                      {email}
                      <button
                        onClick={() => removeKeyUser(email)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={formData.newKeyUser}
                    onChange={(e) => setFormData({...formData, newKeyUser: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && addKeyUser()}
                    placeholder="Email do usuário (ex: user@company.com)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addKeyUser}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              onClick={() => navigate('/applications')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
