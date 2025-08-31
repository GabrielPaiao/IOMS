import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  environments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];
}
