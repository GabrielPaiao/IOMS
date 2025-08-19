// src/companies/dto/create-company-with-admin.dto.ts
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { IsUniqueCompanyName } from '../../shared/validators/unique-company.validator';
import { IsUniqueEmail } from '../../shared/validators/unique-email.validator';

export class CreateCompanyWithAdminDto {
  @IsUniqueCompanyName()
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsOptional()
  @IsString()
  companyDescription?: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @IsUniqueEmail()
  adminEmail: string;

  @IsString()
  @IsNotEmpty()
  adminFirstName: string;

  @IsString()
  @IsNotEmpty()
  adminLastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  adminPassword: string;
}