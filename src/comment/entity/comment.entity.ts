import { Board } from 'src/board/entity/board.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  commentId?: number;

  @Column()
  content: string;

  @Column()
  commentTag: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isDeleted: boolean;

  @ManyToOne(() => Board, (board) => board.comments)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column()
  boardId: number;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'boardId' })
  user: User;

  @Column()
  userId: number;
}
