import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export class ApprovalRequestDto {
  @IsString()
  outageId: string;

  @IsString()
  workflowId: string;

  @IsString()
  stepId: string;

  @IsEnum(['approve', 'reject', 'request_changes'])
  action: 'approve' | 'reject' | 'request_changes';

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsObject()
  changes?: Record<string, any>;
}
