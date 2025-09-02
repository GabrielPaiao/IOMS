import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtBlacklistService } from './services/jwt-blacklist.service';
import { SessionActivityService } from './services/session-activity.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    PassportModule.register({ 
      defaultStrategy: 'jwt',
      session: false, // Desativa sessões se não estiver usando
    }),
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'], // Carrega .env específico do ambiente
      isGlobal: true,
      cache: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.getOrThrow<string>('JWT_SECRET');
        return {
          secret,
          signOptions: { 
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
            algorithm: 'HS256',
            issuer: configService.get('JWT_ISSUER', 'ioms'),
            audience: configService.get('JWT_AUDIENCE', 'ioms-client'),
          },
          verifyOptions: {
            algorithms: ['HS256'],
            ignoreExpiration: false,
          }
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    Reflector,
    JwtBlacklistService,
    SessionActivityService,
    RefreshTokenService,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard, // Guard global de autenticação
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard, // Guard global de autorização
    },
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}