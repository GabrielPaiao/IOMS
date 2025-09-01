// src/hooks/useUser.ts
import { useAuth } from '../context/AuthContext';

export function useUser() {
  const { user: authUser } = useAuth();

  // Usar diretamente os dados do contexto de autenticação
  return { 
    user: authUser, 
    loading: false, 
    error: null 
  };
}
