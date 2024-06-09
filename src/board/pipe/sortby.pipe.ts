import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class SortByPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value !== 'createdAt' && value !== 'viewCount') {
      throw new BadRequestException(
        `'sortBy' 는 'createdAt' 또는 'viewCount' 이어야 합니다.`,
      );
    }
    return value;
  }
}
