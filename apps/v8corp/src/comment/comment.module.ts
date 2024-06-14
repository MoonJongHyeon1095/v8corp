import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from 'src/comment/entity/comment.entity';
import { CommentRepository } from './comment.repository';
import { ConfigService } from '@nestjs/config';
import { BoardRepository } from 'src/board/board.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository, BoardRepository],
})
export class CommentModule {}
