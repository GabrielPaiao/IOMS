// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
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
    });
  }

  async validate(payload: { sub: string }): Promise<Partial<User>> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          companyId: true,
          isActive: true,
          firstName: true, // Útil para logs e mensagens
          lastName: true,  // Útil para logs e mensagens
          location: true,  // Localização do usuário
        },
      });

      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}