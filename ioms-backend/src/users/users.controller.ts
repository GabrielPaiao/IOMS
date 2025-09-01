// src/users/users.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { RegisterWithTokenDto } from './dto/register-with-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async inviteUser(@Body() inviteUserDto: InviteUserDto, @Req() req: Request) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.usersService.inviteUser(
      inviteUserDto, 
      req.user.companyId, 
      req.user.id
    );
  }

  @Post('register/:token')
  async registerWithToken(
    @Param('token') token: string,
    @Body() registerDto: RegisterWithTokenDto
  ) {
    return this.usersService.registerWithToken(token, registerDto);
  }

  @Get('company')
  @UseGuards(JwtAuthGuard)
  async getCompanyUsers(@Req() req: Request) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.usersService.getCompanyUsers(req.user.companyId);
  }

  @Get('me/applications')
  @UseGuards(JwtAuthGuard)
  async getMyApplications(@Req() req: Request) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.usersService.getMyApplications(req.user.id);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchUsers(@Query('email') email: string, @Req() req: Request) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.usersService.searchUsersByEmail(email, req.user.companyId);
  }
}