import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { IsOptional, IsArray, IsEnum, IsString } from 'class-validator';
import { Environment } from '@prisma/client';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @IsOptional()
  @IsArray()
  @IsEnum(Environment, { each: true })
  environments?: Environment[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];
}
