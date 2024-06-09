import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class SortByPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('sortBy:' + value);
    if (
      value !== 'createdAt' &&
      value !== 'totalView' &&
      value !== 'annualView' &&
      value !== 'monthlyView' &&
      value !== 'weeklyView'
    ) {
      throw new BadRequestException(
        `'sortBy' 는 'createdAt','totalView', 'annualView', 'monthlyView','weeklyView' 중 하나여야 합니다.`,
      );
    }
    return value;
  }
}
