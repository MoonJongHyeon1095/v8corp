import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ValidatedUserDto } from 'src/user/dto/user.dto';
import { BoardRepository } from './board.repository';
import {
  CreateBoardDto,
  CreateBoardResponseDto,
  GetQnAResponseDto,
} from './dto/board.dto';
import { Board } from './entity/board.entity';
import { S3Service } from './s3.service';

@Injectable()
export class BoardService {
  constructor(
    private s3Service: S3Service,
    private boardRepository: BoardRepository,
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

  async getQnaList(sortBy: string): Promise<GetQnAResponseDto[]> {
    const noticeList = await this.boardRepository.findAllNotices();
    let qnaList;
    if (sortBy === 'createdAt') {
      qnaList = await this.boardRepository.findAllQnaSortByCreatedAt();
    } else if (sortBy === 'viewCount') {
      qnaList = await this.boardRepository.findAllQnaSortByViewCount();
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
    await this.s3Service.deleteFile(validatedBoard.imageUrl);
    await this.boardRepository.deleteBoard(validatedBoard.boardId);
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

  async validateBoardByUserId(boardId: number, userId: number): Promise<Board> {
    const board = await this.boardRepository.getBoardById(boardId);
    // 게시물이 없는 경우
    if (!board) {
      throw new NotFoundException(`${boardId}번 게시물이 없습니다.`);
    }
    //작성자가 아닌 경우
    if (board.userId !== userId) {
      throw new UnauthorizedException('글 작성자가 아닙니다.');
    }
    return board;
  }
}
