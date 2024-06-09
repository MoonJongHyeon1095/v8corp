import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Board } from './board.entity';

@Entity()
export class View {
  @PrimaryGeneratedColumn()
  viewId: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  viewedAt: Date;

  @ManyToOne(() => Board, (board) => board.views)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column()
  boardId: number;
}
