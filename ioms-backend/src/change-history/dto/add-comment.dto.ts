import { IsString, IsOptional, IsEnum } from 'class-validator';

export class AddCommentDto {
  @IsString()
  outageId: string;

  @IsString()
  comment: string;

  @IsOptional()
  @IsEnum(['comment', 'note', 'feedback', 'question'])
  type?: string;

  @IsString()
  userId: string;
}
