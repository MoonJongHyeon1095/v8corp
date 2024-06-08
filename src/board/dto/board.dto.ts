import { IsString, Length } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}

export class CreateBoardResponseDto {
  title: string;
  content: string;
  imageUrl: string;
}
