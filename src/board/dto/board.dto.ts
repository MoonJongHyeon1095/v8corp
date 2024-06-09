import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Board } from '../entity/board.entity';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  content: string;
}

export class CreateBoardResponseDto {
  boardId: number;
  title: string;
  content: string;
  userId: number;
  author: string;
}

export class GetQnAResponseDto {
  notice: Board[];
  qna: Board[];
}
