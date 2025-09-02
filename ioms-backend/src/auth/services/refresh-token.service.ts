// src/auth/services/refresh-token.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { JwtBlacklistService } from './jwt-blacklist.service';
import { SessionActivityService } from './session-activity.service';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenData {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;
  revokedReason?: string;
}

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private blacklistService: JwtBlacklistService,
    private sessionService: SessionActivityService,
  ) {}

  /**
   * Gera um novo par de tokens (access + refresh) com rotação
   */
  async generateTokenPair(userId: string, oldRefreshToken?: string): Promise<TokenPair> {
    // Se houver um refresh token antigo, revoga ele
    if (oldRefreshToken) {
      await this.revokeRefreshToken(oldRefreshToken, 'Token rotation');
    }

    // Gera novo access token
    const accessTokenPayload = {
      sub: userId,
      type: 'access',
      jti: this.generateTokenId(),
      iss: this.configService.get('JWT_ISSUER', 'ioms'),
      aud: this.configService.get('JWT_AUDIENCE', 'ioms-client'),
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'), // Reduzido para 15 minutos
      secret: this.configService.get('JWT_SECRET'),
    });

    // Gera novo refresh token
    const refreshTokenPayload = {
      sub: userId,
      type: 'refresh',
      jti: this.generateTokenId(),
      iss: this.configService.get('JWT_ISSUER', 'ioms'),
      aud: this.configService.get('JWT_AUDIENCE', 'ioms-client'),
    };

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });

    // Salva o refresh token no banco de dados
    await this.storeRefreshToken(userId, refreshToken);

    this.logger.log(`Novo par de tokens gerado para usuário ${userId}`);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Valida e rotaciona um refresh token
   */
  async rotateRefreshToken(refreshToken: string, ipAddress?: string): Promise<TokenPair> {
    try {
      // Decodifica o refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verifica se o token está na blacklist
      if (this.blacklistService.isTokenRevoked(decoded.jti)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Verifica se o refresh token existe no banco e não foi revogado
      const storedToken = await this.getStoredRefreshToken(decoded.jti);
      if (!storedToken || storedToken.isRevoked) {
        throw new UnauthorizedException('Refresh token not found or revoked');
      }

      // Verifica se o usuário ainda está ativo
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, isActive: true }
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Verifica se a sessão ainda está ativa
      if (!this.sessionService.isSessionActive(decoded.sub)) {
        throw new UnauthorizedException('Session expired due to inactivity');
      }

      // Atualiza última utilização do refresh token
      await this.updateRefreshTokenUsage(decoded.jti);

      // Gera novo par de tokens (rotação)
      const newTokenPair = await this.generateTokenPair(decoded.sub, refreshToken);

      // Atualiza atividade da sessão
      this.sessionService.updateActivity(decoded.sub);

      this.logger.log(`Refresh token rotacionado para usuário ${decoded.sub} de ${ipAddress}`);

      return newTokenPair;

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      this.logger.error(`Erro ao rotacionar refresh token: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Revoga um refresh token específico
   */
  async revokeRefreshToken(refreshToken: string, reason = 'Manual revocation'): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Adiciona à blacklist
      this.blacklistService.revokeToken(decoded.jti, decoded.exp, reason);

      // Marca como revogado no banco
      await this.markRefreshTokenAsRevoked(decoded.jti, reason);

      this.logger.log(`Refresh token ${decoded.jti} revogado. Motivo: ${reason}`);
      return true;

    } catch (error) {
      this.logger.error(`Erro ao revogar refresh token: ${error.message}`);
      return false;
    }
  }

  /**
   * Revoga todos os refresh tokens de um usuário
   */
  async revokeAllUserRefreshTokens(userId: string, reason = 'Logout all sessions'): Promise<number> {
    try {
      // Busca todos os tokens ativos do usuário
      const userTokens = await this.prisma.$queryRaw<{ token_hash: string, expires_at: Date }[]>`
        SELECT token_hash, expires_at FROM refresh_tokens 
        WHERE user_id = ${userId} AND is_revoked = false
      `;

      let revokedCount = 0;

      for (const token of userTokens) {
        try {
          const decoded = this.jwtService.verify(token.token_hash, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            ignoreExpiration: false,
          });

          // Adiciona à blacklist
          this.blacklistService.revokeToken(decoded.jti, decoded.exp, reason);
          revokedCount++;

        } catch (error) {
          // Token pode já estar expirado, continue
          continue;
        }
      }

      // Marca todos como revogados no banco
      await this.prisma.$executeRaw`
        UPDATE refresh_tokens 
        SET is_revoked = true, revoked_at = NOW(), revoked_reason = ${reason}
        WHERE user_id = ${userId} AND is_revoked = false
      `;

      this.logger.log(`${revokedCount} refresh tokens revogados para usuário ${userId}`);
      return revokedCount;

    } catch (error) {
      this.logger.error(`Erro ao revogar tokens do usuário ${userId}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Limpa refresh tokens expirados do banco de dados
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await this.prisma.$executeRaw`
        DELETE FROM refresh_tokens 
        WHERE expires_at < NOW() OR (is_revoked = true AND revoked_at < NOW() - INTERVAL '7 days')
      `;

      this.logger.log(`Cleanup: ${result} refresh tokens expirados removidos`);
      return Number(result);

    } catch (error) {
      this.logger.error(`Erro durante cleanup de tokens: ${error.message}`);
      return 0;
    }
  }

  /**
   * Gera um ID único para tokens
   */
  private generateTokenId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Armazena refresh token no banco de dados
   */
  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(refreshToken) as any;
      const expiresAt = new Date(decoded.exp * 1000);

      await this.prisma.$executeRaw`
        INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, is_revoked)
        VALUES (${decoded.jti}, ${userId}, ${refreshToken}, ${expiresAt}, NOW(), false)
        ON CONFLICT (id) DO NOTHING
      `;

    } catch (error) {
      this.logger.error(`Erro ao armazenar refresh token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca refresh token armazenado
   */
  private async getStoredRefreshToken(tokenId: string): Promise<RefreshTokenData | null> {
    try {
      const result = await this.prisma.$queryRaw<RefreshTokenData[]>`
        SELECT id, user_id as "userId", token_hash as "tokenHash", 
               expires_at as "expiresAt", is_revoked as "isRevoked",
               created_at as "createdAt", last_used_at as "lastUsedAt",
               revoked_at as "revokedAt", revoked_reason as "revokedReason"
        FROM refresh_tokens 
        WHERE id = ${tokenId}
        LIMIT 1
      `;

      return result[0] || null;

    } catch (error) {
      this.logger.error(`Erro ao buscar refresh token: ${error.message}`);
      return null;
    }
  }

  /**
   * Atualiza última utilização do refresh token
   */
  private async updateRefreshTokenUsage(tokenId: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        UPDATE refresh_tokens 
        SET last_used_at = NOW() 
        WHERE id = ${tokenId}
      `;

    } catch (error) {
      this.logger.error(`Erro ao atualizar uso do refresh token: ${error.message}`);
    }
  }

  /**
   * Marca refresh token como revogado
   */
  private async markRefreshTokenAsRevoked(tokenId: string, reason: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        UPDATE refresh_tokens 
        SET is_revoked = true, revoked_at = NOW(), revoked_reason = ${reason}
        WHERE id = ${tokenId}
      `;

    } catch (error) {
      this.logger.error(`Erro ao revogar refresh token no banco: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas dos refresh tokens
   */
  async getRefreshTokenStats() {
    try {
      const stats = await this.prisma.$queryRaw<Array<{
        total_tokens: bigint;
        active_tokens: bigint;
        revoked_tokens: bigint;
        expired_tokens: bigint;
      }>>`
        SELECT 
          COUNT(*) as total_tokens,
          COUNT(*) FILTER (WHERE is_revoked = false AND expires_at > NOW()) as active_tokens,
          COUNT(*) FILTER (WHERE is_revoked = true) as revoked_tokens,
          COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_tokens
        FROM refresh_tokens
      `;

      const result = stats[0];

      return {
        totalTokens: Number(result.total_tokens),
        activeTokens: Number(result.active_tokens),
        revokedTokens: Number(result.revoked_tokens),
        expiredTokens: Number(result.expired_tokens),
      };

    } catch (error) {
      this.logger.error(`Erro ao obter estatísticas: ${error.message}`);
      return {
        totalTokens: 0,
        activeTokens: 0,
        revokedTokens: 0,
        expiredTokens: 0,
      };
    }
  }
}
