import { Board } from 'src/board/entity/board.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  commentId?: number;

  @Column({
    length: 50,
    nullable: false,
  })
  content: string;

  @Column({
    length: 20,
    nullable: false,
  })
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
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}
