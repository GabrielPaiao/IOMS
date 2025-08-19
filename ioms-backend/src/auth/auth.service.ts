// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma/prisma.service';
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

  async login(user: any) {
    const payload = { 
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      iss: this.configService.get('JWT_ISSUER'),
      aud: this.configService.get('JWT_AUDIENCE'),
    };
    
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
      }),
      refresh_token: this.jwtService.sign(
        { sub: user.id },
        {
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        }
      ),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: user.companyId,
      },
    };
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    
    return this.prisma.$transaction(async (tx) => {
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
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          companyId: true,
          firstName: true,
          lastName: true,
        }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.login(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}