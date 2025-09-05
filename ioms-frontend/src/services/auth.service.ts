import api from './api';
import type { User } from '../types/user';
import { config } from '../../config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('DEBUG: Login called with:', credentials.email);
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    console.log('DEBUG: Login response:', response.data);
    
    if (response.data) {
      // Salvar tokens e usuário
      this.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.user
      );
    }
    
    return response.data;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register/admin', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
    });
    
    if (response.data) {
      // Salvar tokens e usuário
      this.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.user
      );
    }
    
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<{ accessToken: string }>('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignorar erros no logout
    } finally {
      // Limpar dados locais
      localStorage.removeItem(config.TOKEN_STORAGE_KEY);
      localStorage.removeItem(config.REFRESH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(config.USER_STORAGE_KEY);
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  // Métodos auxiliares para gerenciar tokens
  setTokens(accessToken: string, refreshToken: string, user?: User): void {
    console.log('DEBUG: setTokens called with user:', user);
    localStorage.setItem(config.TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(config.REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    
    // Salvar usuário se fornecido
    if (user) {
      console.log('DEBUG: Saving user to localStorage:', JSON.stringify(user));
      localStorage.setItem(config.USER_STORAGE_KEY, JSON.stringify(user));
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(config.TOKEN_STORAGE_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(config.REFRESH_TOKEN_STORAGE_KEY);
  }

  getStoredUser(): User | null {
    const storedUser = localStorage.getItem(config.USER_STORAGE_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  }
}

export const authService = new AuthService();
export default authService; 