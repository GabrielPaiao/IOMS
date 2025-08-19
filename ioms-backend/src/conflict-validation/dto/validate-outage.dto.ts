import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { CriticalityLevel } from '@prisma/client';

export class ValidateOutageDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  applicationId: string;

  @IsString()
  locationId: string;

  @IsArray()
  @IsString({ each: true })
  environments: string[];

  @IsString()
  start: string;

  @IsString()
  end: string;

  @IsEnum(CriticalityLevel)
  criticality: CriticalityLevel;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
