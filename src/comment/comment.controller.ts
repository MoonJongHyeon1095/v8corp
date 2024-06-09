import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidatedUserDto } from 'src/user/dto/user.dto';
import { CommentService } from './comment.service';
import { Request } from 'express';
import { CreateCommentDto } from './dto/comment.dto';
import { Comment } from './entity/comment.entity';
@Controller('v1/api/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  /**
   * 대댓글 생성 API (로그인 필요)
   * @param dto JSON 본문
   * @returns 생성된 댓글 정보
   */
  @Post('subcomment/:commentId')
  @UseGuards(AuthGuard('jwt'))
  async createSubComment(
    @Req() req: Request,
    @Body() dto: CreateCommentDto,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<Comment> {
    const user = req.user as ValidatedUserDto;
    return this.commentService.createSubComment(dto, commentId, user.userId);
  }

  /**
   * 댓글 생성 API (로그인 필요)
   * @param dto JSON 본문
   * @returns 생성된 댓글 정보
   */
  @Post(':boardId')
  @UseGuards(AuthGuard('jwt'))
  async createComment(
    @Req() req: Request,
    @Body() dto: CreateCommentDto,
    @Param('boardId', ParseIntPipe) boardId: number,
  ): Promise<Comment> {
    const user = req.user as ValidatedUserDto;
    return this.commentService.createComment(dto, boardId, user.userId);
  }

  /**
   * 댓글 수정 API (로그인 필요)
   * @param commentId 경로변수
   * @returns 수정된 댓글 정보
   */
  @Put(':commentId')
  @UseGuards(AuthGuard('jwt'))
  async updateComment(
    @Req() req: Request,
    @Body() dto: CreateCommentDto,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<Comment> {
    const user = req.user as ValidatedUserDto;
    return this.commentService.updateComment(commentId, dto, user.userId);
  }

  /**
   * 댓글 삭제 API (로그인 필요)
   * @param commentId 경로변수
   * @returns 문자열
   */
  @Delete(':commentId')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(
    @Req() req: Request,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<string> {
    const user = req.user as ValidatedUserDto;
    return this.commentService.deleteComment(commentId, user.userId);
  }
}
