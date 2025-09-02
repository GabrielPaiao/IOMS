// Configuração da aplicação
export const config = {
  // URL base da API
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // URL base do WebSocket (Socket.IO usa HTTP/HTTPS, não WS)
  WS_BASE_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3000',
  
  // Configurações da aplicação
  APP_NAME: 'IOMS',
  APP_VERSION: '1.0.0',
  
  // Timeouts
  API_TIMEOUT: 10000,
  REFRESH_TOKEN_RETRY_DELAY: 1000,
  
  // Configurações de autenticação
  TOKEN_STORAGE_KEY: 'accessToken',
  REFRESH_TOKEN_STORAGE_KEY: 'refreshToken',
  USER_STORAGE_KEY: 'user',
  
  // Configurações de notificações
  NOTIFICATION_POLLING_INTERVAL: 30000, // 30 segundos
  NOTIFICATION_MAX_RETRIES: 5,
  NOTIFICATION_RETRY_DELAY: 1000,
  
  // Configurações de validação de conflitos
  CONFLICT_VALIDATION_TIMEOUT: 5000,
  CONFLICT_CHECK_INTERVAL: 10000, // 10 segundos
  
  // Configurações de workflow
  WORKFLOW_AUTO_APPROVAL_TIMEOUT: 300000, // 5 minutos
  WORKFLOW_ESCALATION_DELAY: 600000, // 10 minutos
  
  // Configurações de histórico
  CHANGE_HISTORY_MAX_VERSIONS: 100,
  CHANGE_HISTORY_EXPORT_LIMIT: 1000,
  
  // Configurações de paginação
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Configurações de cache
  CACHE_TTL: 300000, // 5 minutos
  CACHE_MAX_SIZE: 100,
  
  // Configurações de real-time
  REALTIME_UPDATE_INTERVAL: 5000, // 5 segundos
  REALTIME_MAX_CONNECTIONS: 10,
  
  // Configurações de exportação
  EXPORT_TIMEOUT: 60000, // 1 minuto
  EXPORT_MAX_SIZE: 10000,
  
  // Configurações de auditoria
  AUDIT_LOG_RETENTION_DAYS: 365,
  AUDIT_LOG_MAX_ENTRIES: 100000,
  
  // Configurações de conformidade
  COMPLIANCE_CHECK_INTERVAL: 86400000, // 24 horas
  COMPLIANCE_REPORT_RETENTION_DAYS: 2555, // 7 anos
  
  // Configurações de performance
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
  LAZY_LOAD_THRESHOLD: 0.8,
  
  // Configurações de erro
  ERROR_RETRY_ATTEMPTS: 3,
  ERROR_RETRY_DELAY: 1000,
  ERROR_NOTIFICATION_DURATION: 5000,
  
  // Configurações de desenvolvimento
  DEBUG_MODE: import.meta.env.DEV || false,
  LOG_LEVEL: import.meta.env.DEV ? 'debug' : 'error',
  MOCK_API: import.meta.env.VITE_MOCK_API === 'true',
};
