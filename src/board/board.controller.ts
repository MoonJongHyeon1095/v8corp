import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { BoardService } from './board.service';
import {
  CreateBoardDto,
  CreateBoardResponseDto,
  GetQnAResponseDto,
} from './dto/board.dto';
import { Request } from 'express';
import { Category } from './enum/category.enum';
import { ValidatedUserDto } from 'src/user/dto/user.dto';
import { BoardPipe } from './pipe/board.pipe';
import { SortByPipe } from './pipe/sortby.pipe';
import { Board } from './entity/board.entity';

@Controller('v1/api/board')
export class BoardController {
  constructor(private boardService: BoardService) {}
  /**
   * 글 검색 API
   * @param query 검색 쿼리
   * @param criteria 검색 기준 (전체: title & author, 제목: title, 작성자: author)
   * @returns 검색 결과 리스트 응답
   */
  @Get('search')
  async searchBoard(
    @Query('query') query: string,
    @Query('criteria') criteria: 'all' | 'title' | 'author',
  ): Promise<Board[]> {
    return this.boardService.search(query, criteria);
  }
  /**
   * QnA 조회 API
   * @param sortBy ?sortBy=createdAt or ?sortBy=viewCount
   * @returns 공지와 QnA 리스트 응답
   */
  @Get('qna')
  async getQnaList(
    @Query('sortBy', SortByPipe) sortBy: string,
  ): Promise<GetQnAResponseDto[]> {
    return this.boardService.getQnaList(sortBy);
  }

  /**
   * 1:1 문의 조회 API (로그인 필요)
   * 사용자가 작성한 문의글만 응답
   * @returns 문의한 게시물 최신순 정렬
   */
  @Get('inquiry')
  @UseGuards(AuthGuard('jwt'))
  async getInquiryList(@Req() req: Request): Promise<Board[]> {
    const user = req.user as ValidatedUserDto;
    return this.boardService.getInquiryList(user.userId);
  }

  /**
   * QnA 생성 API (로그인 필요)
   * @param body JSON 본문
   * @param file 이미지 파일, optional
   * @returns 생성된 게시물 정보
   */
  @Post('qna')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async createQnA(
    @Req() req: Request,
    @Body(BoardPipe) body: CreateBoardDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<CreateBoardResponseDto> {
    const user = req.user as ValidatedUserDto;
    return this.boardService.createBoard(body, user, Category.QnA, file);
  }

  /**
   * 1:1 문의 생성 API (로그인 필요)
   * @param body JSON 본문
   * @param file 이미지 파일, optional
   * @returns 생성된 게시물 정보
   */
  @Post('inquiry')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async createInquiry(
    @Req() req: Request,
    @Body(BoardPipe) body: CreateBoardDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<CreateBoardResponseDto> {
    const user = req.user as ValidatedUserDto;
    return this.boardService.createBoard(body, user, Category.Inquiry, file);
  }

  /**
   * 공지 생성 API (관리자 계정만 가능)
   * @param body JSON 본문
   * @param file 이미지 파일, optional
   * @returns 생성된 게시물 정보
   */
  @Post('notice')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async createNotice(
    @Req() req: Request,
    @Body(BoardPipe) body: CreateBoardDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<CreateBoardResponseDto> {
    const user = req.user as ValidatedUserDto;
    if (user.role !== 'admin') {
      throw new ForbiddenException('공지는 관리자만 작성할 수 있습니다.');
    }
    return this.boardService.createBoard(body, user, Category.Notice, file);
  }

  /**
   * 게시물 수정 API (로그인 필요)
   * @param boardId 경로변수
   * @param body JSON 본문
   * @param file 이미지 파일
   * @returns 수정된 게시글 정보 응답
   */
  @Put(':boardId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async updateBoard(
    @Req() req: Request,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body(BoardPipe) body: CreateBoardDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<CreateBoardResponseDto> {
    const user = req.user as ValidatedUserDto;
    return this.boardService.updateBoard(boardId, user.userId, body, file);
  }

  /**
   * 게시물 삭제 API (로그인 필요)
   * @param boardId 경로변수
   * @returns 문자열
   */
  @Delete(':boardId')
  @UseGuards(AuthGuard('jwt'))
  async deleteBoard(
    @Req() req: Request,
    @Param('boardId', ParseIntPipe) boardId: number,
  ): Promise<string> {
    const user = req.user as ValidatedUserDto;
    return this.boardService.deleteBoard(boardId, user.userId);
  }
}
