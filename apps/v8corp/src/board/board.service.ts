import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentService } from 'src/comment/comment.service';
import { ValidatedUserDto } from 'src/user/dto/user.dto';
import { BoardRepository } from './board.repository';
import {
  CreateBoardDto,
  CreateBoardResponseDto,
  GetQnAResponseDto,
} from './dto/board.dto';
import { Board } from './entity/board.entity';
import { S3Service } from './s3.service';
import { ViewRepository } from './view.repository';

@Injectable()
export class BoardService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly boardRepository: BoardRepository,
    private readonly viewRepository: ViewRepository,
    private readonly commentService: CommentService,
  ) {}

  async search(query: string, criteria: string) {
    switch (criteria) {
      case 'title':
        return this.boardRepository.searchByTitle(query);
      case 'author':
        return this.boardRepository.searchByAuthor(query);
      case 'all':
      default:
        return this.boardRepository.searchByAll(query);
    }
  }

  async getOne(boardId: number) {
    const board = await this.boardRepository.findOneBoardByBoardId(boardId);
    if (!board) throw new NotFoundException('해당 게시물을 찾을 수 없슺니다.');

    const viewedAt = this.getKoreanDate();
    await this.viewRepository.createView(boardId, viewedAt);

    await this.boardRepository.updateViewCount(boardId);

    // 댓글과 대댓글 commentTag로 그룹화
    const commentGroup = board.comments.map((comment) => ({
      commentTag: comment.commentTag,
      ...comment,
    }));
    // commentId로 정렬, commentTag 그룹 안에서 최신순 정렬
    commentGroup.sort((a, b) => a.commentId - b.commentId);
    return {
      ...board,
      commentGroup,
    };
  }

  async getQnaList(sortBy: string): Promise<GetQnAResponseDto[]> {
    const noticeList = await this.boardRepository.findAllNotices();
    let qnaList;
    switch (sortBy) {
      case 'createdAt':
        qnaList = await this.boardRepository.findAllQnaSortByCreatedAt();
      case 'totalView':
        qnaList = await this.boardRepository.findAllQnaSortByViewCount();
      case 'weeklyView':
        qnaList = await this.boardRepository.findAllQnaSortByWeeklyView();
      case 'monthlyView':
        qnaList = await this.boardRepository.findAllQnaSortByMonthlyView();
      case 'annualView':
        qnaList = await this.boardRepository.findAllQnaSortByAnnualView();
      default:
        qnaList = await this.boardRepository.findAllQnaSortByCreatedAt();
    }

    const response: GetQnAResponseDto[] = [
      {
        notice: noticeList,
        qna: qnaList,
      },
    ];
    return response;
  }

  async getInquiryList(userId: number): Promise<Board[]> {
    return this.boardRepository.findAllInquiries(userId);
  }

  async createBoard(
    dto: CreateBoardDto,
    user: ValidatedUserDto,
    category: number,
    file?: Express.Multer.File,
  ): Promise<CreateBoardResponseDto> {
    const boardId = await this.boardRepository.createBoard(
      dto.title,
      dto.content,
      category,
      user.userId,
      user.username,
    );

    // 백그라운드에서 이미지 업로드 및 업데이트
    if (file) {
      this.updateBoardImage(boardId, file).catch((error) => {
        console.error('이미지 업데이트 실패:', error);
      });
    }

    // 이미지 업로드 결과를 기다리지 않고 바로 응답합니다.
    return {
      boardId: boardId,
      title: dto.title,
      content: dto.content,
      userId: user.userId,
      author: user.username,
    };
  }

  async updateBoard(
    boardId: number,
    userId: number,
    dto: CreateBoardDto,
    file?: Express.Multer.File,
  ): Promise<CreateBoardResponseDto> {
    const validatedBoard = await this.validateBoardByUserId(boardId, userId);
    await this.boardRepository.updateBoard(
      validatedBoard.boardId,
      dto.title,
      dto.content,
    );

    // 백그라운드에서 이미지 업로드 및 업데이트
    if (file) {
      this.modifyBoardImage(validatedBoard.imageUrl, file).catch((error) => {
        console.error('이미지 업데이트 실패:', error);
      });
    }

    return {
      boardId: validatedBoard.boardId,
      title: dto.title,
      content: dto.content,
      userId: validatedBoard.userId,
      author: validatedBoard.author,
    };
  }

  async deleteBoard(boardId: number, userId: number): Promise<string> {
    const validatedBoard = await this.validateBoardByUserId(boardId, userId);
    if (validatedBoard.imageUrl) {
      await this.s3Service.deleteFile(validatedBoard.imageUrl);
    }
    await this.boardRepository.deleteBoard(validatedBoard.boardId);
    await this.commentService.deleteCommentByBoardId(boardId);
    return `${validatedBoard.boardId}번 게시물 삭제`;
  }

  async updateBoardImage(
    boardId: number,
    file: Express.Multer.File,
  ): Promise<void> {
    const uploadResult = await this.s3Service.uploadFile(file);
    await this.boardRepository.updateImageUrl(boardId, uploadResult.Location);
  }

  async modifyBoardImage(
    imageUrl: string,
    file: Express.Multer.File,
  ): Promise<void> {
    await this.s3Service.modifyFile(imageUrl, file);
  }

  private async validateBoardByUserId(
    boardId: number,
    userId: number,
  ): Promise<Board> {
    const board = await this.findBoardById(boardId);
    //작성자가 아닌 경우
    if (board.userId !== userId) {
      throw new UnauthorizedException('글 작성자가 아닙니다.');
    }
    return board;
  }

  private async findBoardById(boardId: number) {
    const board = await this.boardRepository.getBoardById(boardId);
    // 게시물이 없는 경우
    if (!board) {
      throw new NotFoundException(`${boardId}번 게시물이 없습니다.`);
    }
    return board;
  }

  private getKoreanDate(): Date {
    const date = new Date();
    date.setHours(date.getHours() + 9); // 한국 시간으로 변환 (UTC+9)
    return new Date(date.toISOString().split('T')[0]); // yyyy-MM-dd 형식으로 변환
  }
}
