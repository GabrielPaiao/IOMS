import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { CriticalityLevel } from '@prisma/client';

export class DashboardFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  environment?: string;

  @IsOptional()
  @IsEnum(CriticalityLevel)
  criticality?: CriticalityLevel;

  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
