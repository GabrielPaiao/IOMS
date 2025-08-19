import { IsString, IsArray, IsOptional } from 'class-validator';

export class ConflictCheckDto {
  @IsOptional()
  @IsString()
  outageId?: string;

  @IsString()
  applicationId: string;

  @IsString()
  locationId: string;

  @IsArray()
  @IsString({ each: true })
  environmentIds: string[];

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsString()
  excludeOutageId?: string;
}
