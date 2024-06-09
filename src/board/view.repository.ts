import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Board } from './entity/board.entity';
import { View } from './entity/view.entity';
@Injectable()
export class ViewRepository {
  constructor(private dataSource: DataSource) {}
  async createView(boardId: number, viewedAt: Date): Promise<View> {
    const view = new View();
    view.boardId = boardId;
    view.viewedAt = viewedAt;

    return this.dataSource
      .getRepository(View)
      .createQueryBuilder()
      .insert()
      .into(View)
      .values(view)
      .execute()
      .then((result) => {
        view.viewId = result.identifiers[0].viewId;
        return view;
      });
  }
  async updatePeriodViewCount(
    pastDate: Date,
    periodViewCount: string,
  ): Promise<void> {
    const query = this.dataSource
      .getRepository(View)
      .createQueryBuilder('view')
      .select('view.boardId', 'boardId')
      .addSelect('COUNT(view.viewId)', 'count')
      .where('view.viewedAt > :pastDate', { pastDate })
      .groupBy('view.boardId');

    const results = await query.getRawMany();
    const boardRepository = this.dataSource.getRepository(Board);
    for (const result of results) {
      await boardRepository.update(result.boardId, {
        [periodViewCount]: result.count,
      });
    }
  }
}
