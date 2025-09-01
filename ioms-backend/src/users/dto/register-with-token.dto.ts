// src/users/dto/register-with-token.dto.ts
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterWithTokenDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @MinLength(8)
  password: string;
}
