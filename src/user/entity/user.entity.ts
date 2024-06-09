import { Board } from 'src/board/entity/board.entity';
import { Comment } from 'src/comment/entity/comment.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId?: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    default: 'normal',
  })
  role: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
