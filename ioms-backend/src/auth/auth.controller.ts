// src/auth/auth.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
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
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      return { 
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials' 
      };
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('register/admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new admin account' })
  @ApiBody({ type: RegisterAdminDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED,
    description: 'Admin registered successfully',
    type: RegisterAdminDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT,
    description: 'Email already exists' 
  })
  async registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
    try {
      return await this.authService.registerAdmin(registerAdminDto);
    } catch (error) {
      console.log('Erro no controller ao registrar admin:', error);
      throw error;
    }
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: HttpStatus.OK,
    description: 'Token refreshed',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token' 
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }
}