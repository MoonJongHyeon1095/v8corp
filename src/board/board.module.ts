import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRepository } from 'src/comment/comment.repository';
import { CommentService } from 'src/comment/comment.service';
import { JwtStrategy } from 'src/jwt/jwt.strategy';
import { BoardController } from './board.controller';
import { BoardRepository } from './board.repository';
import { BoardService } from './board.service';
import { Board } from './entity/board.entity';
import { View } from './entity/view.entity';
import { S3Service } from './s3.service';
import { ViewRepository } from './view.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, View]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [BoardController],
  providers: [
    BoardService,
    CommentService,
    S3Service,
    BoardRepository,
    JwtStrategy,
    ViewRepository,
    CommentRepository,
  ],
})
export class BoardModule {}
