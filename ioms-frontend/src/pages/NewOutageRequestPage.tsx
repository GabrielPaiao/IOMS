// src/pages/NewOutageRequestPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOutagesAdvanced } from '../hooks/useOutagesAdvanced';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Warning, 
  FileText, 
  CheckCircle,
  XCircle,
  HardDrives,
  MapPin
} from '@phosphor-icons/react';

export default function NewOutageRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    applications, 
    createOutage, 
    isLoading, 

    loadApplications 
  } = useOutagesAdvanced();

  const [formData, setFormData] = useState({
    applicationId: '',
    scheduledStart: '',
    scheduledEnd: '',
    criticality: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    reason: '',
    description: '',
    environments: [] as string[],
    locationIds: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedAppKeyUsersCount, setSelectedAppKeyUsersCount] = useState<number>(0);
  const [showSoleKeyUserWarning, setShowSoleKeyUserWarning] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<string>('--');

  // Verificar se o usuário tem permissão para criar outages
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.companyId) {
      loadApplications();
    }
  }, [user?.companyId, loadApplications]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedFormData);

    // Calcular duração automaticamente quando as datas mudam
    if ((name === 'scheduledStart' || name === 'scheduledEnd') && updatedFormData.scheduledStart && updatedFormData.scheduledEnd) {
      const startDate = new Date(updatedFormData.scheduledStart);
      const endDate = new Date(updatedFormData.scheduledEnd);
      
      if (endDate > startDate) {
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        if (hours > 0) {
          setEstimatedDuration(`${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`);
        } else {
          setEstimatedDuration(`${minutes}min`);
        }
      } else {
        setEstimatedDuration('--');
      }
    }

    // Verificar Key Users e carregar dados da aplicação quando selecionada
    if (name === 'applicationId' && value) {
      try {
        const selectedApp = applications.find(app => app.id === value) as any;
        setSelectedApplication(selectedApp);
        
        if (selectedApp && selectedApp.keyUsers && user?.role?.toUpperCase() === 'KEY_USER') {
          const keyUsersCount = selectedApp.keyUsers.length;
          setSelectedAppKeyUsersCount(keyUsersCount);
          
          // Se o usuário é KEY_USER e há apenas 1 Key User na aplicação, mostrar aviso
          if (keyUsersCount === 1) {
            setShowSoleKeyUserWarning(true);
          } else {
            setShowSoleKeyUserWarning(false);
          }
        } else {
          setShowSoleKeyUserWarning(false);
          setSelectedAppKeyUsersCount(0);
        }
      } catch (error) {
        console.error('Erro ao verificar aplicação:', error);
      }
    } else if (name === 'applicationId' && !value) {
      setShowSoleKeyUserWarning(false);
      setSelectedAppKeyUsersCount(0);
      setSelectedApplication(null);
    }

    // Limpar erros de validação quando o usuário digita
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  // Função para lidar com seleção de environments
  const handleEnvironmentChange = (env: string) => {
    setFormData(prev => ({
      ...prev,
      environments: prev.environments.includes(env)
        ? prev.environments.filter(e => e !== env)
        : [...prev.environments, env]
    }));
  };

  // Função para lidar com seleção de locations
  const handleLocationChange = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      locationIds: prev.locationIds.includes(locationId)
        ? prev.locationIds.filter(id => id !== locationId)
        : [...prev.locationIds, locationId]
    }));
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.applicationId) {
      errors.push('Aplicação é obrigatória');
    }

    if (!formData.scheduledStart) {
      errors.push('Data e hora de início são obrigatórios');
    }

    if (!formData.scheduledEnd) {
      errors.push('Data e hora de fim são obrigatórios');
    }

    if (formData.scheduledStart && formData.scheduledEnd) {
      const start = new Date(formData.scheduledStart);
      const end = new Date(formData.scheduledEnd);
      
      if (start >= end) {
        errors.push('A data de fim deve ser posterior à data de início');
      }

      if (start < new Date()) {
        errors.push('A data de início não pode ser no passado');
      }
    }

    if (!formData.reason.trim()) {
      errors.push('Motivo é obrigatório');
    }

    // Validação adicional para Key Users únicos
    if (showSoleKeyUserWarning && user?.role?.toUpperCase() === 'KEY_USER') {
      errors.push('Você é o único Key User desta aplicação. Não é possível criar uma solicitação de outage que você não poderá aprovar.');
    }

    if (!formData.environments.length) {
      errors.push('Selecione pelo menos um ambiente');
    }

    if (!formData.locationIds.length) {
      errors.push('Selecione pelo menos uma localização');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.companyId) {
      setValidationErrors(['Usuário não autenticado']);
      return;
    }

    setIsSubmitting(true);

    try {
      const outageData = {
        ...formData,
        companyId: user.companyId
      };

      await createOutage(outageData);
      
      // Redirecionar para a lista de outages com mensagem de sucesso
      navigate('/outages', { 
        state: { 
          message: 'Outage criada com sucesso! Aguardando aprovação.' 
        } 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar outage';
      setValidationErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
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

  const getCriticalityIcon = (criticality: string) => {
    switch (criticality) {
      case 'CRITICAL': return '🔴';
      case 'HIGH': return '🟠';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Nova Solicitação de Outage
          </h1>
          <p className="text-gray-600 mt-2">
            Preencha os detalhes para solicitar uma nova outage
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Aplicação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aplicação *
              </label>
              <select
                name="applicationId"
                value={formData.applicationId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione uma aplicação</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} - {app.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Aviso para Key User único */}
            {showSoleKeyUserWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex items-start">
                  <Warning className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">
                      ⚠️ Atenção: Key User Único
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Você é o único Key User desta aplicação. Solicitações de outage precisam ser aprovadas por outro Key User da aplicação ou um Administrador. Como você é o único, não será possível aprovar esta solicitação.
                    </p>
                    <p className="text-xs text-amber-600 mt-2">
                      💡 Sugestão: Considere adicionar outro Key User à aplicação ou entre em contato com um Administrador.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Datas e Horários */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data e Hora de Início *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledStart"
                  value={formData.scheduledStart}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data e Hora de Fim *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledEnd"
                  value={formData.scheduledEnd}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Criticalidade e Duração */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Warning className="inline h-4 w-4 mr-1" />
                  Nível de Criticalidade *
                </label>
                <select
                  name="criticality"
                  value={formData.criticality}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Baixa - Sem impacto significativo</option>
                  <option value="MEDIUM">Média - Impacto moderado</option>
                  <option value="HIGH">Alta - Impacto significativo</option>
                  <option value="CRITICAL">Crítica - Impacto crítico</option>
                </select>
                
                {/* Indicador visual de criticalidade */}
                <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCriticalityColor(formData.criticality)}`}>
                  <span className="mr-1">{getCriticalityIcon(formData.criticality)}</span>
                  {formData.criticality}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Duração Estimada (calculada automaticamente)
                </label>
                <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700 font-mono">
                  {estimatedDuration}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Calculada automaticamente com base nas datas de início e fim
                </p>
              </div>
            </div>

            {/* Ambientes */}
            {selectedApplication && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HardDrives className="inline h-4 w-4 mr-1" />
                  Ambientes Afetados *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedApplication.environments?.map((env: any) => (
                    <label key={env.environment} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.environments.includes(env.environment)}
                        onChange={() => handleEnvironmentChange(env.environment)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{env.environment}</span>
                    </label>
                  ))}
                </div>
                {formData.environments.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Selecione pelo menos um ambiente
                  </p>
                )}
              </div>
            )}

            {/* Localizações */}
            {selectedApplication && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Localizações Afetadas *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {selectedApplication.locations?.map((location: any) => (
                    <label key={location.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.locationIds.includes(location.id)}
                        onChange={() => handleLocationChange(location.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{location.name}</span>
                      <span className="text-xs text-gray-500">({location.code})</span>
                    </label>
                  ))}
                </div>
                {formData.locationIds.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Selecione pelo menos uma localização
                  </p>
                )}
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Motivo da Outage *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o motivo da outage..."
                required
              />
            </div>

            {/* Descrição Adicional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Descrição Adicional
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detalhes adicionais, procedimentos, equipe envolvida..."
              />
            </div>

            {/* Erros de Validação */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <XCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Erros de validação encontrados:
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Criar Outage
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            ℹ️ Informações Importantes
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Todas as outages passam por um processo de aprovação</li>
            <li>• Outages críticas requerem aprovação de múltiplos níveis</li>
            <li>• Notificações serão enviadas automaticamente aos aprovadores</li>
            <li>• Você pode acompanhar o status da sua solicitação na lista de outages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}