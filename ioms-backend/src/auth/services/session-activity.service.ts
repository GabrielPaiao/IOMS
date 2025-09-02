// src/auth/services/session-activity.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UserSession {
  userId: string;
  lastActivity: number;
  accessToken: string;
  refreshToken?: string;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionActivityService {
  private readonly logger = new Logger(SessionActivityService.name);
  private readonly activeSessions = new Map<string, UserSession>();
  private readonly cleanupInterval: NodeJS.Timeout;
  private readonly inactivityTimeout: number;

  constructor(private configService: ConfigService) {
    // Timeout de inatividade - padrão 30 minutos
    this.inactivityTimeout = this.configService.get<number>('SESSION_INACTIVITY_TIMEOUT', 30 * 60 * 1000);
    
    // Verifica sessões inativas a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.checkInactiveSessions();
    }, 5 * 60 * 1000);
    
    this.logger.log(`Session Activity Service iniciado. Timeout: ${this.inactivityTimeout / 1000 / 60} minutos`);
  }

  /**
   * Registra uma nova sessão de usuário
   */
  createSession(
    userId: string, 
    accessToken: string, 
    refreshToken?: string,
    ipAddress?: string,
    userAgent?: string
  ): void {
    const session: UserSession = {
      userId,
      lastActivity: Date.now(),
      accessToken,
      refreshToken,
      isActive: true,
      ipAddress,
      userAgent,
    };

    this.activeSessions.set(userId, session);
    this.logger.log(`Nova sessão criada para usuário ${userId} de ${ipAddress}`);
  }

  /**
   * Atualiza a última atividade do usuário
   */
  updateActivity(userId: string): boolean {
    const session = this.activeSessions.get(userId);
    
    if (!session || !session.isActive) {
      return false;
    }

    // Verifica se a sessão já expirou por inatividade
    if (this.isSessionExpired(session)) {
      this.expireSession(userId, 'Inatividade');
      return false;
    }

    session.lastActivity = Date.now();
    this.activeSessions.set(userId, session);
    return true;
  }

  /**
   * Verifica se uma sessão está ativa e válida
   */
  isSessionActive(userId: string): boolean {
    const session = this.activeSessions.get(userId);
    
    if (!session || !session.isActive) {
      return false;
    }

    // Verifica timeout por inatividade
    if (this.isSessionExpired(session)) {
      this.expireSession(userId, 'Timeout por inatividade');
      return false;
    }

    return true;
  }

  /**
   * Expira uma sessão específica
   */
  expireSession(userId: string, reason = 'Sessão expirada'): boolean {
    const session = this.activeSessions.get(userId);
    
    if (!session) {
      return false;
    }

    session.isActive = false;
    this.activeSessions.set(userId, session);
    
    this.logger.log(`Sessão do usuário ${userId} expirada. Motivo: ${reason}`);
    return true;
  }

  /**
   * Remove uma sessão completamente
   */
  removeSession(userId: string): boolean {
    const existed = this.activeSessions.has(userId);
    this.activeSessions.delete(userId);
    
    if (existed) {
      this.logger.log(`Sessão do usuário ${userId} removida`);
    }
    
    return existed;
  }

  /**
   * Obtém informações de uma sessão
   */
  getSessionInfo(userId: string): UserSession | null {
    const session = this.activeSessions.get(userId);
    return session || null;
  }

  /**
   * Obtém tempo restante até a expiração (em segundos)
   */
  getTimeUntilExpiration(userId: string): number | null {
    const session = this.activeSessions.get(userId);
    
    if (!session || !session.isActive) {
      return null;
    }

    const timeElapsed = Date.now() - session.lastActivity;
    const timeRemaining = this.inactivityTimeout - timeElapsed;
    
    return Math.max(0, Math.floor(timeRemaining / 1000));
  }

  /**
   * Lista todas as sessões ativas (para administração)
   */
  getActiveSessions(): Array<Omit<UserSession, 'accessToken' | 'refreshToken'>> {
    const sessions: Array<Omit<UserSession, 'accessToken' | 'refreshToken'>> = [];
    
    for (const session of this.activeSessions.values()) {
      if (session.isActive && !this.isSessionExpired(session)) {
        sessions.push({
          userId: session.userId,
          lastActivity: session.lastActivity,
          isActive: session.isActive,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
        });
      }
    }
    
    return sessions;
  }

  /**
   * Força logout de um usuário específico
   */
  forceLogout(userId: string, reason = 'Logout forçado'): boolean {
    return this.expireSession(userId, reason);
  }

  /**
   * Força logout de todos os usuários (emergência)
   */
  forceLogoutAll(reason = 'Logout global'): number {
    let count = 0;
    
    for (const userId of this.activeSessions.keys()) {
      if (this.expireSession(userId, reason)) {
        count++;
      }
    }
    
    this.logger.warn(`ATENÇÃO: ${count} sessões foram forçadamente expiradas. Motivo: ${reason}`);
    return count;
  }

  /**
   * Verifica se uma sessão expirou por inatividade
   */
  private isSessionExpired(session: UserSession): boolean {
    const timeElapsed = Date.now() - session.lastActivity;
    return timeElapsed > this.inactivityTimeout;
  }

  /**
   * Verifica e limpa sessões inativas periodicamente
   */
  private checkInactiveSessions(): void {
    let expiredCount = 0;
    
    for (const [userId, session] of this.activeSessions) {
      if (session.isActive && this.isSessionExpired(session)) {
        this.expireSession(userId, 'Cleanup automático - inatividade');
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.logger.log(`Cleanup automático: ${expiredCount} sessões expiradas por inatividade`);
    }
  }

  /**
   * Obtém estatísticas das sessões
   */
  getSessionStats() {
    let activeSessions = 0;
    let inactiveSessions = 0;
    let expiredSessions = 0;

    for (const session of this.activeSessions.values()) {
      if (!session.isActive) {
        inactiveSessions++;
      } else if (this.isSessionExpired(session)) {
        expiredSessions++;
      } else {
        activeSessions++;
      }
    }

    return {
      totalSessions: this.activeSessions.size,
      activeSessions,
      inactiveSessions,
      expiredSessions,
      inactivityTimeoutMinutes: this.inactivityTimeout / 1000 / 60,
    };
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
