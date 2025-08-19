import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import outagesService from '../services/outages.service';
import applicationsService from '../services/applications.service';
import dashboardService from '../services/dashboard.service';
import type { Outage } from '../types/outage';
import type { Application } from '../services/applications.service';
import type { DashboardStats, CompanyOverview } from '../services/dashboard.service';

export const useOutagesAdvanced = () => {
  const { user } = useAuth();
  const [outages, setOutages] = useState<Outage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [companyOverview, setCompanyOverview] = useState<CompanyOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar outages
  const loadOutages = useCallback(async (filters?: any) => {
    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await outagesService.getOutages(filters);
      setOutages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load outages');
      console.error('Error loading outages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyId]);

  // Carregar minhas outages
  const loadMyOutages = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await outagesService.getMyOutages();
      setOutages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load my outages');
      console.error('Error loading my outages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Carregar outages pendentes de aprovação
  const loadPendingApproval = useCallback(async () => {
    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await outagesService.getPendingApproval();
      setOutages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending outages');
      console.error('Error loading pending outages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyId]);

  // Carregar aplicações
  const loadApplications = useCallback(async (filters?: any) => {
    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await applicationsService.getApplications(filters);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyId]);

  // Carregar estatísticas do dashboard
  const loadDashboardStats = useCallback(async (filters?: any) => {
    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardStats(filters);
      setDashboardStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      console.error('Error loading dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyId]);

  // Carregar visão geral da empresa
  const loadCompanyOverview = useCallback(async () => {
    if (!user?.companyId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getCompanyOverview();
      setCompanyOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company overview');
      console.error('Error loading company overview:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.companyId]);

  // Criar outage
  const createOutage = useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const newOutage = await outagesService.createOutage(data);
      setOutages(prev => [newOutage, ...prev]);
      return newOutage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create outage');
      console.error('Error creating outage:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar outage
  const updateOutage = useCallback(async (id: string, data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedOutage = await outagesService.updateOutage(id, data);
      setOutages(prev => prev.map(o => o.id === id ? updatedOutage : o));
      return updatedOutage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update outage');
      console.error('Error updating outage:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Aprovar outage
  const approveOutage = useCallback(async (id: string, reason?: string, comments?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const approvedOutage = await outagesService.approveOutage(id, reason, comments);
      setOutages(prev => prev.map(o => o.id === id ? approvedOutage : o));
      return approvedOutage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve outage');
      console.error('Error approving outage:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Rejeitar outage
  const rejectOutage = useCallback(async (id: string, reason?: string, comments?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const rejectedOutage = await outagesService.rejectOutage(id, reason, comments);
      setOutages(prev => prev.map(o => o.id === id ? rejectedOutage : o));
      return rejectedOutage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject outage');
      console.error('Error rejecting outage:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancelar outage
  const cancelOutage = useCallback(async (id: string, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const cancelledOutage = await outagesService.cancelOutage(id, reason);
      setOutages(prev => prev.map(o => o.id === id ? cancelledOutage : o));
      return cancelledOutage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel outage');
      console.error('Error cancelling outage:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remover outage
  const deleteOutage = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await outagesService.deleteOutage(id);
      setOutages(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete outage');
      console.error('Error deleting outage:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter outage por ID
  const getOutageById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const outage = await outagesService.getOutageById(id);
      return outage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch outage');
      console.error('Error fetching outage:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter aplicação por ID
  const getApplicationById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const application = await applicationsService.getApplicationById(id);
      return application;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch application');
      console.error('Error fetching application:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar conflitos
  const checkConflicts = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const conflicts = await outagesService.checkConflicts(filters);
      return conflicts;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check conflicts');
      console.error('Error checking conflicts:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter calendário
  const getCalendar = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const calendar = await outagesService.getCalendar(filters);
      return calendar;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar');
      console.error('Error fetching calendar:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obter histórico de outage
  const getChangeHistory = useCallback(async (outageId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await outagesService.getOutageHistory(outageId);
      return history;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch change history');
      console.error('Error fetching change history:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.companyId) {
      loadOutages();
      loadApplications();
      loadDashboardStats();
      loadCompanyOverview();
    }
  }, [user?.companyId, loadOutages, loadApplications, loadDashboardStats, loadCompanyOverview]);

  return {
    // Estado
    outages,
    applications,
    dashboardStats,
    companyOverview,
    isLoading,
    error,
    
    // Ações de outages
    loadOutages,
    loadMyOutages,
    loadPendingApproval,
    createOutage,
    updateOutage,
    approveOutage,
    rejectOutage,
    cancelOutage,
    deleteOutage,
    getOutageById,
    
    // Ações de aplicações
    loadApplications,
    getApplicationById,
    
    // Ações de dashboard
    loadDashboardStats,
    loadCompanyOverview,
    
    // Outras ações
    checkConflicts,
    getCalendar,
    getChangeHistory,
    clearError,
  };
};
