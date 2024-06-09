import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/comment.dto';
import { randomBytes } from 'crypto';
import { Comment } from './entity/comment.entity';
@Injectable()
export class CommentService {
  constructor(private commentRepository: CommentRepository) {}

  async createComment(
    dto: CreateCommentDto,
    boardId: number,
    userId: number,
  ): Promise<Comment> {
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

  async deleteComment(commentId: number, userId: number): Promise<string> {
    const comment = await this.findCommentById(commentId);
    this.validateUser(comment.userId, userId);
    const result = await this.commentRepository.deleteComment(commentId);
    if (result) return `${commentId}번 댓글 삭제 완료`;
  }

  private async findCommentById(commentId: number): Promise<Comment> {
    const comment = await this.commentRepository.findByCommentId(commentId);
    if (!comment)
      throw new NotFoundException(`${commentId}번 댓글이 없습니다.`);
    return comment;
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
