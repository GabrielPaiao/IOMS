import { IsOptional, IsArray, IsString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class ChangeHistoryFiltersDto {
  @IsOptional()
  @IsString()
  outageId?: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  changeType?: string[];

  @IsOptional()
  @IsString()
  changedBy?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;
}
