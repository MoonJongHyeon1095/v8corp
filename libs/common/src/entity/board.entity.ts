import { User } from './user.entity';
import { Comment } from './comment.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { View } from './view.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  boardId?: number;

  @Column({
    length: 20,
    nullable: false,
  })
  author: string;

  @Column({
    length: 50,
    nullable: false,
  })
  title: string;

  @Column({
    length: 200,
    nullable: false,
  })
  content: string;

  @Column('tinyint', {
    unsigned: true,
    nullable: false,
  })
  category: number;

  @Column({
    length: 255,
    nullable: true,
  })
  imageUrl: string;

  //총 조회수
  @Column('int', {
    unsigned: true,
    default: 0,
  })
  viewCount: number;

  //연간 조회수
  @Column('int', {
    unsigned: true,
    default: 0,
  })
  annualView: number;

  //월간 조회수
  @Column('int', {
    unsigned: true,
    default: 0,
  })
  monthlyView: number;

  //주간 조회수
  @Column('int', {
    unsigned: true,
    default: 0,
  })
  weeklyView: number;

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

  @OneToMany(() => View, (view) => view.board)
  views: View[];
}
