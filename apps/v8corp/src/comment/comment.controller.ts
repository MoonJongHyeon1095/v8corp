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
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
@ApiTags('Comment')
@Controller('v1/api/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  /**
   * 대댓글 생성 API (로그인 필요)
   * @param dto JSON 본문
   * @returns 생성된 댓글 정보
   */
  @Post('subcomment/:commentId')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '대댓글 생성',
    description: 'commentId에 해당하는 댓글에 대댓글 생성',
  })
  @ApiParam({
    name: 'commentId',
    type: Number,
    description: '대댓글을 달 댓글의 ID',
  })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: '대댓글 생성', type: Comment })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글생성',
    description: 'boardId에 해당하는 게시글에 댓글 생성',
  })
  @ApiParam({
    name: 'boardId',
    type: Number,
    description: '댓글을 달 게시글 ID',
  })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: '댓글생성', type: Comment })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글 수정',
    description: '자신이 작성한 댓글만 수정 가능',
  })
  @ApiParam({ name: 'commentId', type: Number, description: '수정할 댓글 ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 200, description: 'Comment updated', type: Comment })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글 삭제',
    description: '자신이 작성한 댓글만 삭제 가능',
  })
  @ApiParam({ name: 'commentId', type: Number, description: '삭제할 댓글 ID' })
  @ApiResponse({ status: 200, description: '댓글 삭제' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteComment(
    @Req() req: Request,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<string> {
    const user = req.user as ValidatedUserDto;
    return this.commentService.deleteCommentByCommentId(commentId, user.userId);
  }
}
