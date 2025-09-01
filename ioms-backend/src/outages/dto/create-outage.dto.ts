// src/outages/dto/create-outage.dto.ts
import { IsString, IsEnum, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { CriticalityLevel } from '@prisma/client';
import { IsValidEnvironment } from '../../shared/validators/environment.validator';
import { IsCuid } from '../../shared/validators/cuid.validator';

export class CreateOutageDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CriticalityLevel)
  criticality: CriticalityLevel;

  @IsCuid()
  applicationId: string;

  @IsCuid()
  locationId: string;

  @IsDateString()
  start: string;

  @IsDateString()
  end: string;

  @IsOptional()
  @IsBoolean()
  planned?: boolean;

  @IsValidEnvironment()
  environments: string[];
}