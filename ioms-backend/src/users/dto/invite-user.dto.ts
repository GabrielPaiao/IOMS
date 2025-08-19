// src/users/dto/invite-user.dto.ts
import { IsEmail, IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { UserRole } from '@prisma/client';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum([UserRole.KEY_USER, UserRole.DEV]) // Apenas esses roles podem ser convidados
  role: UserRole;
}