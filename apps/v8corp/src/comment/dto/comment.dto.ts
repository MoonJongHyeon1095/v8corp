import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  content: string;
}
