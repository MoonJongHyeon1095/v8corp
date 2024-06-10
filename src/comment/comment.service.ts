import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/comment.dto';
import { randomBytes } from 'crypto';
import { Comment } from './entity/comment.entity';
import { BoardRepository } from 'src/board/board.repository';
@Injectable()
export class CommentService {
  constructor(
    private commentRepository: CommentRepository,
    private boardRepository: BoardRepository,
  ) {}

  async createComment(
    dto: CreateCommentDto,
    boardId: number,
    userId: number,
  ): Promise<Comment> {
    await this.validateBoard(boardId);
    const commentTag = this.generateUniqueCommentTag();

    return this.commentRepository.createComment(
      commentTag,
      dto.content,
      boardId,
      userId,
    );
  }

  async createSubComment(
    dto: CreateCommentDto,
    commentId: number,
    userId: number,
  ): Promise<Comment> {
    const mainComment = await this.findCommentById(commentId);
    return this.commentRepository.createSubComment(
      mainComment.commentTag,
      dto.content,
      mainComment.boardId,
      userId,
    );
  }
  async updateComment(
    commentId: number,
    dto: CreateCommentDto,
    userId: number,
  ): Promise<Comment> {
    const comment = await this.findCommentById(commentId);
    this.validateUser(comment.userId, userId);
    const result = await this.commentRepository.updateComment(
      commentId,
      dto.content,
    );
    if (result) return this.commentRepository.findByCommentId(commentId);
  }

  async deleteCommentByCommentId(
    commentId: number,
    userId: number,
  ): Promise<string> {
    const comment = await this.findCommentById(commentId);
    this.validateUser(comment.userId, userId);
    const result = await this.commentRepository.deleteComment(commentId);
    if (result) return `${commentId}번 댓글 삭제 완료`;
  }

  async deleteCommentByBoardId(boardId: number): Promise<void> {
    const commentIds = await this.findAllCommentIdsByBoardId(boardId);

    for (const commentId of commentIds) {
      await this.commentRepository.deleteComment(commentId);
    }
  }

  private async findCommentById(commentId: number): Promise<Comment> {
    const comment = await this.commentRepository.findByCommentId(commentId);
    if (!comment)
      throw new NotFoundException(`${commentId}번 댓글이 없습니다.`);
    return comment;
  }

  private async findAllCommentIdsByBoardId(boardId: number): Promise<number[]> {
    const comments =
      await this.commentRepository.findAllCommentsByBoardId(boardId);
    return comments.map((comment) => comment.commentId);
  }

  private async validateBoard(boardId: number) {
    const board = await this.boardRepository.getBoardById(boardId);
    if (!board)
      throw new NotFoundException(`${boardId}번 게시글이 존하 않습니다`);
  }

  private validateUser(commentUserId: number, userId: number): void {
    if (commentUserId !== userId) {
      throw new ForbiddenException(
        '자신의 댓글만 수정하거나 삭제할 수 있습니다.',
      );
    }
  }

  private generateUniqueCommentTag(): string {
    return randomBytes(10).toString('hex'); //20글자
  }
}
