import { User } from 'src/user/entity/user.entity';
import { Comment } from 'src/comment/entity/comment.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  boardId?: number;

  @Column()
  author: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  category: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  imageUrl: string;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  viewCount: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.boards)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Comment, (comment) => comment.board)
  comments: Comment[];
}
