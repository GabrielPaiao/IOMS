import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/user';
import authService, { type LoginCredentials, type RegisterData } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Primeiro tenta buscar do localStorage
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(normalizeUserRole(storedUser));
          } else {
            // Se não tem no localStorage, busca do servidor
            const currentUser = await authService.getCurrentUser();
            setUser(normalizeUserRole(currentUser));
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Limpar tokens inválidos
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const normalizeUserRole = (user: any): User => {
    const roleMapping: Record<string, 'dev' | 'key_user' | 'admin'> = {
      'DEV': 'dev',
      'KEY_USER': 'key_user',
      'ADMIN': 'admin'
    };

    return {
      ...user,
      role: roleMapping[user.role] || user.role.toLowerCase()
    };
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      // O authService.login já salva tokens e usuário, apenas definir no contexto
      setUser(normalizeUserRole(response.user));
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      // O authService já deve salvar tokens e usuário
      setUser(normalizeUserRole(response.user));
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(normalizeUserRole(currentUser));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 