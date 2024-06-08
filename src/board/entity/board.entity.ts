import { User } from 'src/user/entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  boardId?: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  imageUrl: string;

  @ManyToOne(() => User, (user) => user.boards)
  user: User;
}
