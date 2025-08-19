// src/auth/guards/jwt-auth.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../shared/decorators/public.decorator';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      return null;
    }
    
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException(this.getErrorMessage(info));
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  private getErrorMessage(info: any): string {
    if (info instanceof Error) {
      return info.message;
    }
    switch (info?.name) {
      case 'TokenExpiredError':
        return 'Token expired';
      case 'JsonWebTokenError':
        return 'Invalid token';
      default:
        return 'Authentication failed';
    }
  }
}