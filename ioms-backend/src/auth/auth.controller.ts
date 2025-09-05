// src/auth/auth.controller.ts
import { Body, Controller, Post, Get, Request, HttpCode, HttpStatus, UsePipes, ValidationPipe, Req, Headers } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../shared/decorators/public.decorator';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Authentication')
@Controller('auth')
@UsePipes(new ValidationPipe({ 
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true 
}))
export class AuthController {
  @Get('me')
  async getMe(@Request() req) {
    // Retorna os dados do usuário autenticado
    return req.user;
  }
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentativas por minuto para login
  @ApiOperation({ summary: 'Authenticate user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Login successful',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error' 
  })
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      return { 
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials' 
      };
    }
    
    // Captura informações da requisição para auditoria
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    return this.authService.login(user, ipAddress, userAgent);
  }

  @Public()
  @Post('register/admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new admin account' })
  @ApiBody({ type: RegisterAdminDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED,
    description: 'Admin registered successfully',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT,
    description: 'Email already exists' 
  })
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto, @Req() req: any) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      return await this.authService.registerAdmin(registerAdminDto, ipAddress, userAgent);
    } catch (error) {
      console.log('Erro no controller ao registrar admin:', error);
      throw error;
    }
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token with rotation' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Token refreshed with rotation',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token' 
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    return this.authService.refreshToken(refreshTokenDto.refresh_token, ipAddress);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and revoke tokens' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async logout(
    @Request() req: any,
    @Headers('authorization') authHeader?: string,
    @Body() body?: { refreshToken?: string }
  ) {
    const userId = req.user?.id;
    
    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    // Extrai o token do header Authorization
    const accessToken = authHeader?.replace('Bearer ', '');
    const refreshToken = body?.refreshToken;

    return this.authService.logout(userId, accessToken, refreshToken);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all sessions and revoke all tokens' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'All sessions terminated',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        tokensRevoked: { type: 'number' }
      }
    }
  })
  async logoutAll(@Request() req: any) {
    const userId = req.user?.id;
    
    if (!userId) {
      return {
        success: false,
        tokensRevoked: 0
      };
    }

    return this.authService.logoutAll(userId);
  }

  @Get('session-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current session status and remaining time' })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Session status information',
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean' },
        timeRemaining: { type: 'number', nullable: true },
        sessionInfo: { type: 'object' }
      }
    }
  })
  async getSessionStatus(@Request() req: any) {
    const userId = req.user?.id;
    
    if (!userId) {
      return {
        isActive: false,
        timeRemaining: null,
        sessionInfo: null
      };
    }

    const isActive = this.authService.isUserSessionActive(userId);
    const timeRemaining = this.authService.getSessionTimeRemaining(userId);
    const sessionInfo = this.authService.getUserSessionInfo(userId);

    return {
      isActive,
      timeRemaining,
      sessionInfo: sessionInfo ? {
        lastActivity: sessionInfo.lastActivity,
        ipAddress: sessionInfo.ipAddress,
        userAgent: sessionInfo.userAgent,
      } : null
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 tentativas por 5 minutos
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Password reset email sent (if email exists)',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 tentativas por 5 minutos
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Password successfully reset',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token' 
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }
}