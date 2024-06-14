import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Board } from 'libs/common/src/entity/board.entity';
import { CircuitBreakerInterceptor } from 'libs/common/src/interceptor/resilience.interceptor';
import { InfoService } from './info.service';

@Controller()
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  /**
   * 글 검색 API
   * @param query 검색 쿼리
   * @param criteria 검색 기준 (전체: title & author, 제목: title, 작성자: author)
   * @returns 검색 결과 리스트 응답
   */
  @Get('search')
  @ApiOperation({
    summary: '게시글 검색',
    description: '검색어와 검색기준으로 게시글 검색',
  })
  @ApiQuery({ name: 'query', type: String, description: '검색어' })
  @ApiQuery({
    name: 'criteria',
    type: String,
    enum: ['all', 'title', 'author'],
    description: '검색기준',
  })
  @ApiResponse({ status: 200, description: '검색 성공', type: [Board] })
  @UseInterceptors(CircuitBreakerInterceptor)
  async searchBoard(
    @Query('query') query: string,
    @Query('criteria') criteria: 'all' | 'title' | 'author',
  ): Promise<Board[]> {
    return this.infoService.search(query, criteria);
  }
}
