import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  companyId: string;

  @IsArray()
  @IsString({ each: true })
  environments: string[];

  @IsArray()
  @IsString({ each: true })
  locations: string[];

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyUsers?: string[];
}
