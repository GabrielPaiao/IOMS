import { IsString, IsArray, IsOptional, IsBoolean, IsDateString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ApproverDto {
  @IsString()
  userId: string;

  @IsNumber()
  order: number;

  @IsBoolean()
  required: boolean;
}

export class CreateWorkflowDto {
  @IsString()
  outageId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApproverDto)
  approvers: ApproverDto[];

  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
