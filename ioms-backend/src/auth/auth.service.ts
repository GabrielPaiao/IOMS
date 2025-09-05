// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma/prisma.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { SessionActivityService } from './services/session-activity.service';
import { JwtBlacklistService } from './services/jwt-blacklist.service';
import * as bcrypt from 'bcryptjs';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly sessionService: SessionActivityService,
    private readonly blacklistService: JwtBlacklistService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        companyId: true,
        isActive: true,
        firstName: true,
        lastName: true,
      }
    });
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any, ipAddress?: string, userAgent?: string) {
    // Gera novo par de tokens com rotação
    const tokenPair = await this.refreshTokenService.generateTokenPair(user.id);
    
    // Cria sessão do usuário
    this.sessionService.createSession(
      user.id, 
      tokenPair.accessToken, 
      tokenPair.refreshToken,
      ipAddress,
      userAgent
    );

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: user.companyId,
      },
      // Informações adicionais sobre a sessão
      sessionInfo: {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
        refreshExpiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        inactivityTimeout: this.configService.get('SESSION_INACTIVITY_TIMEOUT', 30 * 60 * 1000),
      }
    };
  }

  async registerAdmin(dto: RegisterAdminDto, ipAddress?: string, userAgent?: string) {
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        // Verifica se email já existe
        const existingUser = await tx.user.findUnique({
          where: { email: dto.email },
        });

        if (existingUser) {
          throw new ConflictException('Email already in use');
        }

        // Cria company apenas com o nome
        const company = await tx.company.create({
          data: { 
            name: dto.companyName
          },
        });

        return tx.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: UserRole.ADMIN,
            companyId: company.id,
            isActive: true,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            companyId: true,
          }
        });
      });

      // Gerar tokens e sessão como no login
      const tokenPair = await this.refreshTokenService.generateTokenPair(user.id);
      
      // Criar sessão do usuário
      this.sessionService.createSession(
        user.id, 
        tokenPair.accessToken, 
        tokenPair.refreshToken,
        ipAddress,
        userAgent
      );

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          companyId: user.companyId,
        },
        // Informações adicionais sobre a sessão
        sessionInfo: {
          expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
          refreshExpiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
          inactivityTimeout: this.configService.get('SESSION_INACTIVITY_TIMEOUT', 30 * 60 * 1000),
        }
      };
    } catch (error) {
      console.log('Erro ao registrar admin:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string, ipAddress?: string) {
    try {
      // Usa o serviço de refresh token com rotação
      const tokenPair = await this.refreshTokenService.rotateRefreshToken(refreshToken, ipAddress);
      
      // Busca informações do usuário
      const decoded = this.jwtService.decode(tokenPair.accessToken) as any;
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          role: true,
          companyId: true,
          firstName: true,
          lastName: true,
        }
      });

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        user,
        sessionInfo: {
          expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
          refreshExpiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
          inactivityTimeout: this.configService.get('SESSION_INACTIVITY_TIMEOUT', 30 * 60 * 1000),
        }
      };

    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout seguro com revogação de tokens
   */
  async logout(userId: string, accessToken?: string, refreshToken?: string): Promise<{ success: boolean; message: string }> {
    try {
      // Revoga o refresh token se fornecido
      if (refreshToken) {
        await this.refreshTokenService.revokeRefreshToken(refreshToken, 'User logout');
      }

      // Adiciona access token à blacklist se fornecido
      if (accessToken) {
        try {
          const decoded = this.jwtService.decode(accessToken) as any;
          if (decoded && decoded.jti && decoded.exp) {
            this.blacklistService.revokeToken(decoded.jti, decoded.exp, 'User logout');
          }
        } catch (error) {
          // Token pode já estar inválido, continua
        }
      }

      // Remove/expira a sessão
      this.sessionService.removeSession(userId);

      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Erro durante logout'
      };
    }
  }

  /**
   * Logout de todas as sessões do usuário
   */
  async logoutAll(userId: string): Promise<{ success: boolean; tokensRevoked: number }> {
    try {
      // Revoga todos os refresh tokens do usuário
      const tokensRevoked = await this.refreshTokenService.revokeAllUserRefreshTokens(userId, 'Logout all sessions');

      // Remove sessão ativa
      this.sessionService.removeSession(userId);

      return {
        success: true,
        tokensRevoked
      };

    } catch (error) {
      return {
        success: false,
        tokensRevoked: 0
      };
    }
  }

  /**
   * Verifica se um usuário tem sessão ativa
   */
  isUserSessionActive(userId: string): boolean {
    return this.sessionService.isSessionActive(userId);
  }

  /**
   * Obtém informações da sessão do usuário
   */
  getUserSessionInfo(userId: string): any {
    return this.sessionService.getSessionInfo(userId);
  }

  /**
   * Obtém tempo restante da sessão
   */
  getSessionTimeRemaining(userId: string): number | null {
    return this.sessionService.getTimeUntilExpiration(userId);
  }

  /**
   * Solicita reset de senha - gera token e envia email
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true, isActive: true }
    });

    if (!user || !user.isActive) {
      // Por segurança, sempre retorna sucesso mesmo se o email não existir
      return {
        success: true,
        message: 'If the email exists in our system, you will receive a password reset link.'
      };
    }

    // Gera token JWT temporário (expira em 1 hora)
    const resetToken = this.jwtService.sign(
      { 
        userId: user.id, 
        email: user.email, 
        purpose: 'password-reset' 
      },
      { 
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h' 
      }
    );

    // Salva o token no banco (opcional, para invalidar tokens usados)
    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      }
    });

    // TODO: Implementar envio de email
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return {
      success: true,
      message: 'If the email exists in our system, you will receive a password reset link.'
    };
  }

  /**
   * Reset de senha usando o token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verifica se o token está na blacklist
      if (await this.blacklistService.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Decodifica e valida o token
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET')
      });

      if (decoded.purpose !== 'password-reset') {
        throw new UnauthorizedException('Invalid token purpose');
      }

      // Verifica se o token ainda está válido no banco
      const resetTokenRecord = await this.prisma.passwordResetToken.findFirst({
        where: {
          token,
          userId: decoded.userId,
          usedAt: null,
          expiresAt: { gt: new Date() }
        }
      });

      if (!resetTokenRecord) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Atualiza a senha do usuário
      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
      
      await this.prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword }
      });

      // Marca o token como usado
      await this.prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() }
      });

      // Adiciona o token à blacklist
      await this.blacklistService.addToBlacklist(token, new Date(decoded.exp * 1000));

      // Revoga todos os refresh tokens do usuário por segurança
      await this.refreshTokenService.revokeAllUserRefreshTokens(decoded.userId, 'Password reset');

      return {
        success: true,
        message: 'Password has been successfully reset.'
      };

    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}