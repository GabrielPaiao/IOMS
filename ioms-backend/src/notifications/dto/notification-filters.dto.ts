import { IsOptional, IsArray, IsString, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationFiltersDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  read?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  type?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priority?: string[];

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;
}
