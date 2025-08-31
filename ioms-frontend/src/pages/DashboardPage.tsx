// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOutagesAdvanced } from '../hooks/useOutagesAdvanced';
import { 
  ChartBar, 
  Clock, 
  CheckCircle, 
  Warning as ExclamationTriangle,
  Calendar,
  Users,
  Building
} from '@phosphor-icons/react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { 
    dashboardStats, 
    companyOverview, 
    isLoading, 
    error,
    loadDashboardStats,
    loadCompanyOverview 
  } = useOutagesAdvanced();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  // Filtro por ambiente removido

  useEffect(() => {
    if (user?.companyId) {
      loadDashboardStats();
      loadCompanyOverview();
    }
  }, [user?.companyId, loadDashboardStats, loadCompanyOverview]);

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              loadDashboardStats();
              loadCompanyOverview();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardStats || !companyOverview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum dado disponível</h2>
          <p className="text-gray-600">Configure o sistema para ver as estatísticas</p>
        </div>
      </div>
    );
  }

  const { overview, criticality, applications, performance } = dashboardStats;
  const { summary } = companyOverview;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard - {user?.companyName || 'Empresa'}
          </h1>
          <p className="text-gray-600">
            Visão geral das operações e métricas do sistema
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="quarter">Último Trimestre</option>
              </select>
            </div>

            {/* Filtro por ambiente removido */}
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Outages */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Outages</p>
                <p className="text-2xl font-bold text-gray-900">{overview.total}</p>
              </div>
            </div>
          </div>

          {/* Outages Pendentes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{overview.pending}</p>
              </div>
            </div>
          </div>

          {/* Outages Aprovadas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-gray-900">{overview.approved}</p>
              </div>
            </div>
          </div>

          {/* Taxa de Aprovação */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.approvalRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Criticalidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Critical */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{criticality.critical}</p>
              </div>
            </div>
          </div>

          {/* High */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ExclamationTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Altas</p>
                <p className="text-2xl font-bold text-orange-600">{criticality.high}</p>
              </div>
            </div>
          </div>

          {/* Medium */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Médias</p>
                <p className="text-2xl font-bold text-yellow-600">{criticality.medium}</p>
              </div>
            </div>
          </div>

          {/* Low */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ExclamationTriangle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Baixas</p>
                <p className="text-2xl font-bold text-green-600">{criticality.low}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance de Aprovação */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance de Aprovação</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tempo Médio de Aprovação</span>
                <span className="font-medium text-gray-900">
                  {performance.averageApprovalTime ? 
                    `${Math.round(performance.averageApprovalTime / (1000 * 60 * 60))}h` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tempo Mínimo</span>
                <span className="font-medium text-gray-900">
                  {performance.minApprovalTime ? 
                    `${Math.round(performance.minApprovalTime / (1000 * 60 * 60))}h` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tempo Máximo</span>
                <span className="font-medium text-gray-900">
                  {performance.maxApprovalTime ? 
                    `${Math.round(performance.maxApprovalTime / (1000 * 60 * 60))}h` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Resumo da Empresa */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Empresa</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm text-gray-600">Aplicações:</span>
                <span className="ml-auto font-medium text-gray-900">{summary.applications}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm text-gray-600">Usuários:</span>
                <span className="ml-auto font-medium text-gray-900">{summary.users}</span>
              </div>
              <div className="flex items-center">
                <ChartBar className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm text-gray-600">Total de Outages:</span>
                <span className="ml-auto font-medium text-gray-900">{summary.outages}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-sm text-gray-600">Outages Ativas:</span>
                <span className="ml-auto font-medium text-gray-900">{summary.activeOutages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Aplicações */}
        {applications.top && applications.top.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Aplicações com Mais Outages</h3>
            <div className="space-y-3">
              {applications.top.map((app: any, index: number) => (
                <div key={app.applicationId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-600 mr-3">#{index + 1}</span>
                    <span className="font-medium text-gray-900">Aplicação {app.applicationId}</span>
                  </div>
                  <span className="text-sm text-gray-600">{app._count.id} outages</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gráficos e Visualizações */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualizações</h3>
          <div className="text-center py-12 text-gray-500">
            <ChartBar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Gráficos e visualizações serão implementados aqui</p>
            <p className="text-sm">Integração com bibliotecas de gráficos como Chart.js ou Recharts</p>
          </div>
        </div>
      </div>
    </div>
  );
}