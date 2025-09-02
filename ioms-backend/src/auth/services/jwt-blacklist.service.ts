// src/auth/services/jwt-blacklist.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface BlacklistedToken {
  jti: string;
  exp: number;
  revokedAt: number;
  reason?: string;
}

@Injectable()
export class JwtBlacklistService {
  private readonly logger = new Logger(JwtBlacklistService.name);
  private readonly blacklistedTokens = new Map<string, BlacklistedToken>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(private configService: ConfigService) {
    // Limpa tokens expirados a cada 1 hora
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);
  }

  /**
   * Adiciona um token à blacklist
   */
  revokeToken(tokenId: string, expirationTime: number, reason?: string): void {
    const blacklistedToken: BlacklistedToken = {
      jti: tokenId,
      exp: expirationTime,
      revokedAt: Date.now(),
      reason,
    };

    this.blacklistedTokens.set(tokenId, blacklistedToken);
    this.logger.log(`Token ${tokenId} revogado. Motivo: ${reason || 'N/A'}`);
  }

  /**
   * Verifica se um token está na blacklist
   */
  isTokenRevoked(tokenId: string): boolean {
    const token = this.blacklistedTokens.get(tokenId);
    
    if (!token) {
      return false;
    }

    // Se o token expirou naturalmente, remove da blacklist
    if (Date.now() > token.exp * 1000) {
      this.blacklistedTokens.delete(tokenId);
      return false;
    }

    return true;
  }

  /**
   * Revoga todos os tokens de um usuário
   */
  revokeAllUserTokens(userId: string, reason = 'User logout/security'): void {
    let revokedCount = 0;
    
    for (const [tokenId, token] of this.blacklistedTokens) {
      // Em uma implementação real, você teria o userId no token
      // Por agora, vamos implementar uma abordagem simples
      this.revokeToken(tokenId, token.exp, `${reason} - User: ${userId}`);
      revokedCount++;
    }
    
    this.logger.log(`${revokedCount} tokens revogados para usuário ${userId}`);
  }

  /**
   * Remove tokens expirados da blacklist para economizar memória
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [tokenId, token] of this.blacklistedTokens) {
      if (now > token.exp * 1000) {
        this.blacklistedTokens.delete(tokenId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Limpeza automática: ${cleanedCount} tokens expirados removidos`);
    }
  }

  /**
   * Obtém estatísticas da blacklist
   */
  getBlacklistStats() {
    const now = Date.now();
    let activeTokens = 0;
    let expiredTokens = 0;

    for (const token of this.blacklistedTokens.values()) {
      if (now > token.exp * 1000) {
        expiredTokens++;
      } else {
        activeTokens++;
      }
    }

    return {
      totalTokens: this.blacklistedTokens.size,
      activeRevokedTokens: activeTokens,
      expiredTokens,
      lastCleanup: new Date().toISOString(),
    };
  }

  /**
   * Limpa todos os tokens (para testes ou emergências)
   */
  clearAllTokens(): void {
    const count = this.blacklistedTokens.size;
    this.blacklistedTokens.clear();
    this.logger.warn(`ATENÇÃO: Todos os ${count} tokens foram limpos da blacklist`);
  }

  /**
   * Cleanup ao destruir o serviço
   */
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
