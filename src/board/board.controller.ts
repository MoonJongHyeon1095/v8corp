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
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CircuitBreakerInterceptor } from '../interceptor/resilience.interceptor';

@ApiTags('Board')
@Controller('v1/api/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}
  /**
   * 글 검색 API
   * @param query 검색 쿼리
   * @param criteria 검색 기준 (전체: title & author, 제목: title, 작성자: author)
   * @returns 검색 결과 리스트 응답
   */
  @Get('search')
  @ApiOperation({
    summary: '게시글 검색',
    description: '검색어와 검색기준으로 게시글 검색',
  })
  @ApiQuery({ name: 'query', type: String, description: '검색어' })
  @ApiQuery({
    name: 'criteria',
    type: String,
    enum: ['all', 'title', 'author'],
    description: '검색기준',
  })
  @ApiResponse({ status: 200, description: '검색 성공', type: [Board] })
  @UseInterceptors(CircuitBreakerInterceptor)
  async searchBoard(
    @Query('query') query: string,
    @Query('criteria') criteria: 'all' | 'title' | 'author',
  ): Promise<Board[]> {
    return this.boardService.search(query, criteria);
  }
  /**
   * QnA 리스트 조회 API
   * 최신순, 총 조회순, 주간 조회순, 월간 조회순, 연간 조회순
   * @param sortBy createdAt or totalView or weeklyView or monthlyView or annualView
   * @returns 공지와 QnA 리스트 응답
   */
  @Get('qna')
  @ApiOperation({
    summary: 'QnA 리스트, 공지 리스트 조회',
    description: '공지 리스트와 함께, 정렬 기준에 따른 QnA 리스트 반환',
  })
  @ApiQuery({
    name: 'sortBy',
    type: String,
    description: '정렬기준',
    enum: ['createdAt', 'totalView', 'weeklyView', 'monthlyView', 'annualView'],
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [GetQnAResponseDto],
  })
  async getQnaList(
    @Query('sortBy', SortByPipe) sortBy: string,
  ): Promise<GetQnAResponseDto[]> {
    return this.boardService.getQnaList(sortBy);
  }

  /**
   * 1:1 문의 리스트 조회 API (로그인 필요)
   * 사용자가 작성한 문의글만 응답
   * @returns 문의한 게시물 최신순 정렬
   */
  @Get('inquiry')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '1:1 문의 리스트 조회',
    description: '사용자가 작성한 1:1 문의글만 반환',
  })
  @ApiResponse({ status: 200, description: '조회 성공', type: [Board] })
  async getInquiryList(@Req() req: Request): Promise<Board[]> {
    const user = req.user as ValidatedUserDto;
    return this.boardService.getInquiryList(user.userId);
  }

  /**
   * 게시글 상세 조회 API
   * @param boardId 경로 변수
   * @returns 댓글 대댓글 포함 게시글 상세 응답
   */
  @Get(':boardId')
  @ApiOperation({
    summary: '글 상세 조회',
    description: '댓글 및 대댓글을 포함한 게시글 상세조회, 총 조회수 증가',
  })
  @ApiParam({ name: 'boardId', type: Number, description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '조회 성공', type: Board })
  async getOne(
    @Param('boardId', ParseIntPipe) boardId: number,
  ): Promise<Board> {
    return this.boardService.getOne(boardId);
  }

  /**
   * QnA 생성 API (로그인 필요)
   * @param body JSON 본문
   * @param file 이미지 파일, optional
   * @returns 생성된 게시물 정보
   */
  @Post('qna')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'QnA 생성',
    description: 'QnA 생성, 이미지 파일은 optional',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'QnA Data',
    schema: {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'QnA 제목' },
            content: { type: 'string', description: 'QnA 내용' },
          },
          description: 'JSON body of the QnA',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional image file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'QnA 생성',
    type: CreateBoardResponseDto,
  })
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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '1:1 문의 생성',
    description: '1:1 문의 생성, 이미지 파일은 optional',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Inquiry Data',
    schema: {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '문의글 제목' },
            content: { type: 'string', description: '문의글 내용' },
          },
        },
        file: { type: 'string', format: 'binary', description: '이미지 파일' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '1:1 문의 생성',
    type: CreateBoardResponseDto,
  })
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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '공지 생성',
    description: '공지글 생성, 이미지파일은 optional',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Notice Data',
    schema: {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '공지 제목' },
            content: { type: 'string', description: '공지 내용' },
          },
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional image file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '공지 생성',
    type: CreateBoardResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - 관리자만 작성 가능' })
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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '게시글 수정',
    description: '모든 카테고리의 게시글 수정, 작성자만 수정 가능',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update Board Data',
    schema: {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '수정 제목' },
            content: { type: 'string', description: '수정 내용' },
          },
        },
        file: {
          type: 'string',
          format: 'binary',
          description: '수정 이미지(optional)',
        },
      },
    },
  })
  @ApiParam({ name: 'boardId', type: Number, description: '수정할 게시글 ID' })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
    type: CreateBoardResponseDto,
  })
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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '게시글 삭제',
    description: '해당 작성자만 삭제 가능',
  })
  @ApiParam({ name: 'boardId', type: Number, description: '삭제할 게시글 ID' })
  @ApiResponse({ status: 200, description: '삭제 완료' })
  async deleteBoard(
    @Req() req: Request,
    @Param('boardId', ParseIntPipe) boardId: number,
  ): Promise<string> {
    const user = req.user as ValidatedUserDto;
    return this.boardService.deleteBoard(boardId, user.userId);
  }
}
