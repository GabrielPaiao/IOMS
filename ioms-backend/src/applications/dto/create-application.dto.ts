import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { Environment } from '@prisma/client';

export class CreateApplicationDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  companyId: string;

  @IsArray()
  @IsEnum(Environment, { each: true })
  environments: Environment[];

  @IsArray()
  @IsString({ each: true })
  locations: string[];

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  technology?: string;

  @IsOptional()
  @IsString()
  owner?: string;
}
