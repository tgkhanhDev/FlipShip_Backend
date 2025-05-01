import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { log } from 'console';
import { AppValidateException } from '../exception/app.exception';
import { ErrorCode } from '../exception/errorCode.dto';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    const errorsMap = new Map<string, string>();

    if (errors.length > 0) {
      errors.map((error) => {
        if (error.constraints) {
          const constraintMap = new Map<string, string>(
            Object.entries(error?.constraints),
          );

          //handle errors
          for (const [key, value] of constraintMap) {
            if (errorsMap.has(error.property)) {
              errorsMap.set(
                error.property,
                errorsMap.get(error.property) + ', ' + value,
              );
              continue;
            }
            errorsMap.set(error.property, value);
          }
        }
      });

      throw new AppValidateException(ErrorCode.VALIDATION_ERROR, errorsMap);
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
