import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { BoardRepository } from './board.repository';
import { ViewRepository } from './view.repository';
import { CommentService } from 'src/comment/comment.service';
import { S3Service } from './s3.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('BoardService', () => {
  let service: BoardService;
  let boardRepository: Partial<BoardRepository>;
  let viewRepository: Partial<ViewRepository>;
  let commentService: Partial<CommentService>;
  let s3Service: Partial<S3Service>;

  beforeEach(async () => {
    boardRepository = {
      findOneBoardByBoardId: jest.fn().mockResolvedValue({
        boardId: 1,
        title: '테스트 제목',
        content: '테스트 내용',
        comments: [],
        userId: 1,
      }),
      createBoard: jest.fn().mockResolvedValue(1),
      deleteBoard: jest.fn().mockResolvedValue({ affected: 1 }),
      updateViewCount: jest.fn(),
      getBoardById: jest.fn().mockResolvedValue({
        boardId: 1,
        userId: 1,
      }),
    };

    viewRepository = {
      createView: jest.fn().mockResolvedValue(true),
    };

    commentService = {
      deleteCommentByBoardId: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    s3Service = {
      uploadFile: jest
        .fn()
        .mockResolvedValue({ Location: 'http://example.com/image.jpg' }),
      deleteFile: jest.fn().mockResolvedValue(true),
      modifyFile: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        { provide: BoardRepository, useValue: boardRepository },
        { provide: ViewRepository, useValue: viewRepository },
        { provide: CommentService, useValue: commentService },
        { provide: S3Service, useValue: s3Service },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('boardId로 조회', async () => {
    const board = await service.getOne(1);
    expect(boardRepository.findOneBoardByBoardId).toHaveBeenCalledWith(1);
    expect(board.boardId).toEqual(1);
  });

  it('게시글 생성', async () => {
    const createBoardDto = { title: 'New Board', content: 'Content here' };
    const user = { userId: 1, username: 'testUser', role: 'normal' };
    const result = await service.createBoard(createBoardDto, user, 1);
    expect(boardRepository.createBoard).toHaveBeenCalled();
    expect(result).toHaveProperty('boardId', 1);
  });

  // it('should throw NotFoundException if board to delete is not found', async () => {
  //   boardRepository.getBoardById.mockResolvedValue(null);
  //   await expect(service.deleteBoard(999, 1)).rejects.toThrow(
  //     NotFoundException,
  //   );
  // });

  // it('should throw UnauthorizedException if user tries to delete board they do not own', async () => {
  //   boardRepository.getBoardById.mockResolvedValue({ boardId: 1, userId: 2 });
  //   await expect(service.deleteBoard(1, 1)).rejects.toThrow(
  //     UnauthorizedException,
  //   );
  // });
});
