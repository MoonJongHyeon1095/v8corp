import { Board } from 'src/board/entity/board.entity';
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

  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];
}
