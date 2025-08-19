export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    issuer: process.env.JWT_ISSUER || 'ioms',
    audience: process.env.JWT_AUDIENCE || 'ioms-client',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  notifications: {
    websocket: {
      enabled: process.env.WEBSOCKET_ENABLED === 'true',
      path: process.env.WEBSOCKET_PATH || '/notifications',
    },
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT ?? '587', 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    },
  },
  workflow: {
    autoApprove: process.env.AUTO_APPROVE === 'true',
    defaultDeadline: process.env.DEFAULT_DEADLINE || '24h',
  },
  validation: {
    conflictCheck: {
      enabled: process.env.CONFLICT_CHECK_ENABLED !== 'false',
      bufferTime: parseInt(process.env.CONFLICT_BUFFER_TIME ?? '15', 10) || 15, // minutos
    },
    businessRules: {
      enabled: process.env.BUSINESS_RULES_ENABLED !== 'false',
      maxCriticalDuration: parseInt(process.env.MAX_CRITICAL_DURATION ?? '4', 10) || 4, // horas
      maxHighDuration: parseInt(process.env.MAX_HIGH_DURATION ?? '8', 10) || 8, // horas
    },
  },
});
