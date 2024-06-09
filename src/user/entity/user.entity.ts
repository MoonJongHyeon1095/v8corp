import { Board } from '../../board/entity/board.entity';
import { Comment } from '../../comment/entity/comment.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId?: number;

  @Column({
    length: 20,
    nullable: false,
  })
  username: string;

  @Column({
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    length: 10,
    nullable: false,
    default: 'normal',
  })
  role: string;

  @Column({
    length: 255,
    nullable: true,
  })
  refreshToken?: string;

  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
