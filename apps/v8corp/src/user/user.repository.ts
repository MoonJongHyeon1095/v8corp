import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UserRepository {
  constructor(private dataSource: DataSource) {}

  async findByUserId(userId: number): Promise<User | null> {
    return this.dataSource
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.userId = :userId', { userId })
      .getOne();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.dataSource
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.username = :username', { username })
      .getOne();
  }

  async createUser(
    username: string,
    password: string,
    role: string,
  ): Promise<User> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          username: username,
          password: password,
          role: role,
        },
      ])
      .execute();

    return this.findByUsername(username);
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(User)
      .set({ refreshToken })
      .where('userId = :userId', { userId })
      .execute();
  }
}
