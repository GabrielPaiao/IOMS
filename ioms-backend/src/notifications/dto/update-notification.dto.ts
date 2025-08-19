import { IsOptional, IsString, IsBoolean, IsEnum, IsObject, IsDateString } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsDateString()
  readAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
