import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import { config } from '../../config';

// Criar instância do axios
const api: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
import { config as appConfig } from '../../config';
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem(appConfig.TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem(config.REFRESH_TOKEN_STORAGE_KEY);
        if (refreshToken) {
          const response = await axios.post(`${config.API_BASE_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem(config.TOKEN_STORAGE_KEY, accessToken);

          // Repetir a requisição original com o novo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Se falhar ao renovar, redirecionar para login
        localStorage.removeItem(config.TOKEN_STORAGE_KEY);
        localStorage.removeItem(config.REFRESH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(config.USER_STORAGE_KEY);
        
        // Redirecionar para login apenas se não estiver já na página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export { api };
export default api; 