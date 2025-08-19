import { IsOptional, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class WorkflowFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @IsString()
  approverId?: string;

  @IsOptional()
  @IsString()
  outageId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;
}
