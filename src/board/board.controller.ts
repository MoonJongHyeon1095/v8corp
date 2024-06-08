import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/board.dto';

@Controller('v1/api/board')
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createBoard(
    @Body() dto: CreateBoardDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.boardService.createBoard(dto, file);
  }
}
