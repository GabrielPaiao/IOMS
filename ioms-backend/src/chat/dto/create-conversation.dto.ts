import { IsString, IsNotEmpty, IsArray, IsOptional, IsEmail } from 'class-validator';
import { IsCuid } from '../../shared/validators/cuid.validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  participantEmails: string[];

  @IsString()
  @IsOptional()
  type?: 'direct' | 'group' | 'outage' | 'application';

  @IsCuid()
  @IsOptional()
  relatedOutageId?: string;

  @IsCuid()
  @IsOptional()
  relatedApplicationId?: string;
}
