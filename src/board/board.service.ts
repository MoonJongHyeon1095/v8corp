import { Injectable } from '@nestjs/common';
import { CreateBoardDto, CreateBoardResponseDto } from './dto/board.dto';
import { S3Service } from './s3.service';

@Injectable()
export class BoardService {
  constructor(private s3Service: S3Service) {}

  async createBoard(
    dto: CreateBoardDto,
    file: Express.Multer.File,
  ): Promise<CreateBoardResponseDto> {
    const uploadResult = await this.s3Service.uploadFile(file);
    // 데이터베이스에 게시글 및 이미지 URL 저장 로직 추가
    return {
      ...dto,
      imageUrl: uploadResult.Location,
    };
  }
}
