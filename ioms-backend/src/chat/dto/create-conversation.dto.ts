import { IsString, IsNotEmpty, IsArray, IsUUID, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  participantIds: string[];

  @IsString()
  @IsOptional()
  type?: 'direct' | 'group' | 'outage' | 'application';

  @IsUUID()
  @IsOptional()
  relatedOutageId?: string;

  @IsUUID()
  @IsOptional()
  relatedApplicationId?: string;
}
