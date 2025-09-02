import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NestApplicationOptions } from '@nestjs/common';

async function bootstrap() {
  // Try to load SSL certificates for HTTPS
  let appOptions: NestApplicationOptions = {};
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction || process.env.ENABLE_HTTPS === 'true') {
    try {
      const keyPath = process.env.SSL_KEY_PATH || join(__dirname, '..', 'ssl', 'key.pem');
      const certPath = process.env.SSL_CERT_PATH || join(__dirname, '..', 'ssl', 'cert.pem');
      
      appOptions.httpsOptions = {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath),
      };
    } catch (error) {
      console.warn('⚠️  SSL certificates not found. Running in HTTP mode.');
      if (isProduction) {
        console.error('🚨 PRODUCTION mode requires HTTPS! Please configure SSL certificates.');
        process.exit(1);
      }
    }
  }

  const app = await NestFactory.create(AppModule, appOptions);

  const configService = app.get(ConfigService);

  // Security headers with Helmet
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // Disable for WebSocket compatibility
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "ws:", "wss:"], // Allow WebSocket connections
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: appOptions.httpsOptions ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    } : false, // Only enable HSTS if HTTPS is available
  }));
  
  // CORS configuration - more restrictive for production
  const corsOrigins = isProduction 
    ? (process.env.CORS_ORIGINS?.split(',') || ['https://your-production-domain.com'])
    : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];
    
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Configuração de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Prefixo global da API
  app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 3001;
  
  await app.listen(port);
  
  const protocol = appOptions.httpsOptions ? 'https' : 'http';
  const wsProtocol = appOptions.httpsOptions ? 'wss' : 'ws';
  
  console.log(`🚀 IOMS Backend rodando na porta ${port} (${protocol.toUpperCase()})`);
  console.log(`📡 WebSocket disponível em ${wsProtocol}://localhost:${port}/chat`);
  console.log(`🌐 API REST disponível em ${protocol}://localhost:${port}/api`);
  
  if (appOptions.httpsOptions) {
    console.log(`🔒 HTTPS ativado com certificados SSL`);
  } else {
    console.log(`⚠️  HTTP mode - Para produção, configure HTTPS`);
  }
}

bootstrap();
