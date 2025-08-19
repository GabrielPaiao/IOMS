// src/outages/dto/create-outage.dto.ts
import { IsString, IsEnum, IsUUID, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { CriticalityLevel, Environment } from '@prisma/client';
import { IsValidEnvironment } from '../../shared/validators/environment.validator';

export class CreateOutageDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CriticalityLevel)
  criticality: CriticalityLevel;

  @IsUUID()
  applicationId: string;

  @IsUUID()
  locationId: string;

  @IsDateString()
  start: Date;

  @IsDateString()
  end: Date;

  @IsOptional()
  @IsBoolean()
  planned?: boolean;

  @IsValidEnvironment()
  @IsEnum(Environment, { each: true })
  environments: Environment[];
}