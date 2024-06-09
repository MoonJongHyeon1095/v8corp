import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Comment } from './entity/comment.entity';

@Injectable()
export class CommentRepository {
  constructor(private dataSource: DataSource) {}

  async findByCommentId(commentId: number): Promise<Comment | null> {
    return this.dataSource
      .createQueryBuilder()
      .select('comment')
      .from(Comment, 'comment')
      .where('comment.commentId = :commentId', { commentId })
      .getOne();
  }

  async createComment(
    commentTag: string,
    content: string,
    boardId: number,
    userId: number,
  ): Promise<Comment> {
    const insertResult = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values([
        {
          commentTag: commentTag,
          content: content,
          boardId: boardId,
          userId: userId,
        },
      ])
      .execute();

    const commentId = insertResult.identifiers[0].commentId;
    return this.findByCommentId(commentId);
  }

  async createSubComment(
    commentTag: string,
    content: string,
    boardId: number,
    userId: number,
  ): Promise<Comment> {
    const insertResult = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values([
        {
          commentTag: commentTag,
          content: content,
          boardId: boardId,
          userId: userId,
        },
      ])
      .execute();

    const commentId = insertResult.identifiers[0].commentId;
    return this.findByCommentId(commentId);
  }

  async updateComment(commentId: number, content: string): Promise<number> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Comment)
      .set({ content: content })
      .where('commentId = :commentId', { commentId })
      .execute();

    return result.affected;
  }

  async deleteComment(commentId: number): Promise<number> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Comment)
      .set({ isDeleted: true })
      .where('commentId = :commentId', { commentId })
      .execute();

    return result.affected;
  }

  async findCommentsByBoardId(boardId: number): Promise<Comment[]> {
    return this.dataSource
      .createQueryBuilder()
      .select('comment')
      .from(Comment, 'comment')
      .where('comment.boardId = :boardId', { boardId })
      .getMany();
  }
}
