// src/users/dto/invite-user.dto.ts
import { IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum([UserRole.KEY_USER, UserRole.DEV, UserRole.ADMIN])
  role: UserRole;
}