import { useState, useEffect, useCallback } from 'react';
import type { Outage } from '../types/outage';
import outagesService from '../services/outages.service';

interface UseOutagesOptions {
  companyId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useOutages(options: UseOutagesOptions = {}) {
  const { companyId, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [outages, setOutages] = useState<Outage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status?: Outage['status'];
    criticality?: Outage['criticality'];
    location?: string;
    environment?: string;
    applicationId?: string;
  }>({});

  // Função para carregar outages
  const loadOutages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        companyId,
      };
      
      const fetchedOutages = await outagesService.getOutages(params);
      setOutages(fetchedOutages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar outages');
      console.error('Erro ao carregar outages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, companyId]);

  // Carregar outages inicialmente
  useEffect(() => {
    loadOutages();
  }, [loadOutages]);

  // Auto-refresh se habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadOutages, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadOutages]);

  // Função para criar nova outage
  const createOutage = async (data: any) => {
    try {
      const newOutage = await outagesService.createOutage(data);
      setOutages(prev => [newOutage, ...prev]);
      return newOutage;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao criar outage');
    }
  };

  // Função para atualizar outage
  const updateOutage = async (id: string, data: any) => {
    try {
      const updatedOutage = await outagesService.updateOutage(id, data);
      setOutages(prev => prev.map(o => o.id === id ? updatedOutage : o));
      return updatedOutage;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar outage');
    }
  };

  // Função para deletar outage
  const deleteOutage = async (id: string) => {
    try {
      await outagesService.deleteOutage(id);
      setOutages(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao deletar outage');
    }
  };

  // Função para aprovar outage
  const approveOutage = async (id: string) => {
    try {
      const approvedOutage = await outagesService.approveOutage(id);
      setOutages(prev => prev.map(o => o.id === id ? approvedOutage : o));
      return approvedOutage;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao aprovar outage');
    }
  };

  // Função para rejeitar outage
  const rejectOutage = async (id: string, reason?: string) => {
    try {
      const rejectedOutage = await outagesService.rejectOutage(id, reason);
      setOutages(prev => prev.map(o => o.id === id ? rejectedOutage : o));
      return rejectedOutage;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao rejeitar outage');
    }
  };

  // Função para aplicar filtros
  const applyFilters = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Filtrar outages baseado nos filtros aplicados
  const filteredOutages = outages.filter(outage => {
    if (filters.status && outage.status !== filters.status) return false;
    if (filters.criticality && outage.criticality !== filters.criticality) return false;
    if (filters.location && outage.location !== filters.location) return false;
    if (filters.environment && !outage.environment.includes(filters.environment)) return false;
    if (filters.applicationId && outage.applicationId !== filters.applicationId) return false;
    return true;
  });

  return {
    // Estado
    outages: filteredOutages,
    allOutages: outages,
    isLoading,
    error,
    filters,
    
    // Ações
    loadOutages,
    createOutage,
    updateOutage,
    deleteOutage,
    approveOutage,
    rejectOutage,
    applyFilters,
    clearFilters,
    
    // Utilitários
    refresh: loadOutages,
  };
}
