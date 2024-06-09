import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from 'src/jwt/jwt.strategy';
import { BoardController } from './board.controller';
import { BoardRepository } from './board.repository';
import { BoardService } from './board.service';
import { Board } from './entity/board.entity';
import { S3Service } from './s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [BoardController],
  providers: [BoardService, S3Service, BoardRepository, JwtStrategy],
})
export class BoardModule {}
