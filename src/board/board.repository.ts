import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Board } from './entity/board.entity';

@Injectable()
export class BoardRepository {
  constructor(private dataSource: DataSource) {}

  async createBoard(
    title: string,
    content: string,
    category: number,
    userId: number,
    author: string,
  ): Promise<number> {
    const newBoard = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(Board)
      .values({ title, content, category, userId, author })
      .execute();

    return newBoard.identifiers[0].boardId;
  }

  async updateImageUrl(boardId: number, imageUrl: string): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(Board)
      .set({ imageUrl: imageUrl })
      .where('boardId = :boardId', { boardId: boardId })
      .execute();
  }

  async updateBoard(
    boardId: number,
    title: string,
    content: string,
  ): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(Board)
      .set({ title, content })
      .where('boardId = :boardId', { boardId })
      .execute();
  }

  async deleteBoard(boardId: number): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(Board)
      .set({ isDeleted: true })
      .where('boardId = :boardId', { boardId })
      .execute();
  }

  async getBoardById(boardId: number): Promise<Board | null> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.boardId = :boardId', { boardId })
      .andWhere('board.isDeleted = false')
      .getOne();
  }

  async getAllBoards(category: number): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.category = :category', { category })
      .andWhere('board.isDeleted = false')
      .getMany();
  }

  async findAllNotices(): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.category = 0')
      .andWhere('board.isDeleted = false')
      .getMany();
  }

  async findAllQnaSortByCreatedAt(): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.category = 1')
      .andWhere('board.isDeleted = false')
      .orderBy('board.createdAt', 'DESC')
      .getMany();
  }

  async findAllQnaSortByViewCount(): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.category = 1')
      .andWhere('board.isDeleted = false')
      .orderBy('board.viewCount', 'DESC')
      .getMany();
  }

  async findAllInquiries(userId: number): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.userId = :userId', { userId })
      .where('board.category = 2')
      .andWhere('board.isDeleted = false')
      .orderBy('board.createdAt', 'DESC')
      .getMany();
  }

  async searchByAll(query: string): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.title LIKE :query', { query: `%${query}%` })
      .orWhere('board.author LIKE :query', { query: `%${query}%` })
      .andWhere('board.isDeleted = false')
      .getMany();
  }

  async searchByAuthor(query: string): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.author LIKE :query', { query: `%${query}%` })
      .andWhere('board.isDeleted = false')
      .getMany();
  }

  async searchByTitle(query: string): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.title LIKE :query', { query: `%${query}%` })
      .andWhere('board.isDeleted = false')
      .getMany();
  }
}
