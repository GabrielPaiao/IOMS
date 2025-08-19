// src/users/users.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
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
    @Body() createUserDto: CreateUserDto
  ) {
    return this.usersService.registerWithToken(token, createUserDto);
  }

  @Get('company')
  @UseGuards(JwtAuthGuard)
  async getCompanyUsers(@Req() req: Request) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return this.usersService.getCompanyUsers(req.user.companyId);
  }
}