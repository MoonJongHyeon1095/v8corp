import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateCommentDto } from './dto/comment.dto';
import { Comment } from './entity/comment.entity';

describe('CommentService', () => {
  let service: CommentService;
  let mockRepository: Partial<CommentRepository>;
  let createCommentDto: CreateCommentDto;
  let comment: Comment;

  beforeEach(async () => {
    mockRepository = {
      createComment: jest.fn(),
      findByCommentId: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
      findAllCommentsByBoardId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: CommentRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);

    createCommentDto = { content: '테스트' };
    comment = {
      commentId: 1,
      content: '테스트',
      userId: 1,
      boardId: 1,
      commentTag: 'abc123',
    } as Comment;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    it('댓글 등록 성공', async () => {
      jest.spyOn(mockRepository, 'createComment').mockResolvedValue(comment);
      const result = await service.createComment(createCommentDto, 1, 1);
      expect(result).toEqual(comment);
      expect(mockRepository.createComment).toHaveBeenCalledWith(
        expect.any(String),
        createCommentDto.content,
        1,
        1,
      );
    });
  });

  describe('updateComment', () => {
    it('댓글 수정시 수정 대상인 댓글이 없을 떄', async () => {
      jest.spyOn(mockRepository, 'findByCommentId').mockResolvedValue(null);
      await expect(
        service.updateComment(1, createCommentDto, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('댓글 수정시 작성자가 다를 때', async () => {
      jest
        .spyOn(mockRepository, 'findByCommentId')
        .mockResolvedValue({ ...comment, userId: 2 });
      await expect(
        service.updateComment(1, createCommentDto, 1),
      ).rejects.toThrow(ForbiddenException);
    });

    it('작성자 같으면 댓글 수정', async () => {
      jest.spyOn(mockRepository, 'findByCommentId').mockResolvedValue(comment);
      jest.spyOn(mockRepository, 'updateComment').mockResolvedValue(1); //affectedRow 행의 수 반환
      jest
        .spyOn(mockRepository, 'findByCommentId')
        .mockResolvedValue({ ...comment, content: 'Updated' });

      const updatedComment = await service.updateComment(
        1,
        createCommentDto,
        1,
      );
      expect(updatedComment.content).toBe('Updated');
    });
  });

  describe('deleteCommentByCommentId', () => {
    it('댓글 삭제시 삭제 대상이 없을 떄', async () => {
      jest.spyOn(mockRepository, 'findByCommentId').mockResolvedValue(null);
      await expect(service.deleteCommentByCommentId(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('작성자 맞으면 댓글 삭제', async () => {
      jest.spyOn(mockRepository, 'findByCommentId').mockResolvedValue(comment);
      jest.spyOn(mockRepository, 'deleteComment').mockResolvedValue(1);
      const result = await service.deleteCommentByCommentId(1, 1);
      expect(result).toBe('1번 댓글 삭제 완료');
    });
  });
});
