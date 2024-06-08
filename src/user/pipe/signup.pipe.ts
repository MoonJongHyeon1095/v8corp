import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError, Validator } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class SignupPipe implements PipeTransform {
  private validator = new Validator();

  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToClass(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      this.throwCustomException(errors);
    }

    return value;
  }

  private throwCustomException(errors: ValidationError[]) {
    const formattedErrors = errors.map((err) => {
      const constraints = err.constraints;
      const messages = [];

      if (constraints) {
        if (err.property === 'username') {
          messages.push('username은 4글자 이상, 20글자 이하 이어야 합니다.');
        }
        if (err.property === 'password') {
          messages.push('password는 10글자 이상, 20글자 이하 이어야 합니다.');
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
