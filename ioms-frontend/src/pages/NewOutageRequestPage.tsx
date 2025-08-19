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
  XCircle
} from '@phosphor-icons/react';

export default function NewOutageRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    applications, 
    createOutage, 
    isLoading, 
    error,
    loadApplications 
  } = useOutagesAdvanced();

  const [formData, setFormData] = useState({
    applicationId: '',
    scheduledStart: '',
    scheduledEnd: '',
    criticality: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    reason: '',
    estimatedDuration: 60,
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (user?.companyId) {
      loadApplications();
    }
  }, [user?.companyId, loadApplications]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erros de validação quando o usuário digita
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
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

    if (formData.estimatedDuration <= 0) {
      errors.push('Duração estimada deve ser maior que zero');
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
        companyId: user.companyId,
        estimatedDuration: formData.estimatedDuration * 60 // Converter para segundos
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
                  Duração Estimada (minutos) *
                </label>
                <input
                  type="number"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  min="1"
                  max="1440"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo: 24 horas (1440 minutos)
                </p>
              </div>
            </div>

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