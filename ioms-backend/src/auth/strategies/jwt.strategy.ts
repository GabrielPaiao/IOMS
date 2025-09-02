// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { JwtBlacklistService } from '../services/jwt-blacklist.service';
import { SessionActivityService } from '../services/session-activity.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly blacklistService: JwtBlacklistService,
    private readonly sessionService: SessionActivityService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.cookies?.['access_token'], // Opcional: suporte a cookies
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
      issuer: configService.get<string>('JWT_ISSUER'), // Recomendo definir no .env
      audience: configService.get<string>('JWT_AUDIENCE'), // Recomendo definir no .env
      passReqToCallback: true, // Para acessar o request
    });
  }

  async validate(req: any, payload: { sub: string; jti: string; type?: string }): Promise<Partial<User>> {
    try {
      // 1. Verifica tipo do token
      if (payload.type && payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type for authentication');
      }

      // 2. Verifica se o token está na blacklist
      if (payload.jti && this.blacklistService.isTokenRevoked(payload.jti)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // 3. Verifica se a sessão está ativa
      if (!this.sessionService.isSessionActive(payload.sub)) {
        throw new UnauthorizedException('Session expired due to inactivity');
      }

      // 4. Busca e valida o usuário
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          companyId: true,
          isActive: true,
          firstName: true,
          lastName: true,
          location: true,
        },
      });

      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // 5. Atualiza atividade da sessão
      this.sessionService.updateActivity(payload.sub);

      // 6. Log de acesso (opcional, para auditoria)
      const ipAddress = req?.ip || req?.connection?.remoteAddress;
      const userAgent = req?.get('User-Agent');
      
      // Você pode implementar um log de auditoria aqui se necessário
      
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}