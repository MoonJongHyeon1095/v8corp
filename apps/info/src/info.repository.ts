import { Injectable, NotFoundException } from '@nestjs/common';
import { Board } from 'libs/common/src/entity/board.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class InfoRepository {
  constructor(private readonly dataSource: DataSource) {}
  /**
   * 조회수 카운트 비관적 락 사용
   * @param boardId
   */
  async updateViewCount(boardId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const board = await queryRunner.manager
        .getRepository(Board)
        .createQueryBuilder('board')
        .where('board.boardId = :boardId', { boardId })
        .andWhere('board.isDeleted = false')
        .setLock('pessimistic_write')
        .getOne();

      if (!board) {
        await queryRunner.rollbackTransaction();
        throw new NotFoundException('해당 게시물을 찾을 수 없습니다.');
      }

      board.viewCount = board.viewCount ? board.viewCount + 1 : 1;
      await queryRunner.manager.save(board);

      await queryRunner.commitTransaction();
    } catch (err) {
      // 실패시 롤백
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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

  async findOneBoardByBoardId(boardId: number): Promise<Board | null> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.comments', 'comment')
      .where('board.boardId = :boardId', { boardId })
      .andWhere('board.isDeleted = false')
      .getOne();
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

  async findAllQnaSortByWeeklyView(): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.category = 1')
      .andWhere('board.isDeleted = false')
      .orderBy('board.weeklyView', 'DESC')
      .getMany();
  }

  async findAllQnaSortByMonthlyView(): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.category = 1')
      .andWhere('board.isDeleted = false')
      .orderBy('board.monthlyView', 'DESC')
      .getMany();
  }

  async findAllQnaSortByAnnualView(): Promise<Board[]> {
    return this.dataSource
      .getRepository(Board)
      .createQueryBuilder('board')
      .where('board.category = 1')
      .andWhere('board.isDeleted = false')
      .orderBy('board.annualView', 'DESC')
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
