import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError, Validator } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BoardPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    let data;
    try {
      data = JSON.parse(value.body);
    } catch (error) {
      throw new BadRequestException('JSON 형식이 올바르지 않습니다.');
    }

    const object = plainToClass(metadata.metatype, data);
    const errors = await validate(object);
    console.log('Metadata metatype:', metadata.metatype);
    console.log('DTO class:', metadata.metatype.name);
    console.log('Transformed object:', object);
    if (errors.length > 0) {
      this.throwCustomException(errors);
    }

    return data;
  }

  private throwCustomException(errors: ValidationError[]) {
    const formattedErrors = errors.map((err) => {
      const constraints = err.constraints;
      const messages = [];

      if (constraints) {
        if (err.property === 'title') {
          messages.push('제목을 입력해주십시오');
        }
        if (err.property === 'content') {
          messages.push('내용을 입력해주십시오');
        }
      }

      return messages.join(' ');
    });

    throw new BadRequestException({
      message: formattedErrors,
      error: '데이터 형식 에러',
    });
  }
}
