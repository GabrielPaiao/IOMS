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
    const response = await api.post<LoginResponse>('/auth/login', credentials);
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
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(config.TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(config.REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(config.TOKEN_STORAGE_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(config.REFRESH_TOKEN_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
export default authService; 