import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { IsCuid } from '../../shared/validators/cuid.validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsCuid()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsOptional()
  replyToMessageId?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @IsString()
  @IsOptional()
  attachmentType?: string;
}
