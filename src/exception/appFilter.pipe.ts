// common/app-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode, ErrorMessages } from './errorCode.dto';
import { AppException, AppValidateException } from './app.exception';
import { ApiResponse } from 'src/common/utils/response.dto';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = 500;
    let errorCode = ErrorCode.SERVER_ERROR;
    let message = exception.response?.message || ErrorMessages[errorCode].message;
    let details = exception.response?.detail || exception?.message || 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      if (exception instanceof AppException) {
        const exceptionResponse = exception.getResponse() as any;
        errorCode = exceptionResponse.errorCode;
        message = exceptionResponse.message;
        details = exceptionResponse.details;
      } else if (exception instanceof AppValidateException) {
        const exceptionResponse = exception.getResponse() as any;
        errorCode = ErrorCode.VALIDATION_ERROR;
        message = ErrorMessages[errorCode].message;
        details = exceptionResponse.details;
      } else {
        // errorCode = ErrorCode.SERVER_ERROR;
        // message = ErrorMessages[errorCode].message;
        // details = exception.getResponse();
      }
    }

    if(status === 500) Logger.error(details)

    response.status(status).json({
      status: status,
      message,
      data: this.convertMapToRecord(details),
    } as ApiResponse<any>);
  }

  private convertMapToRecord(details: any): any {
    if (details instanceof Map) {
      return Object.fromEntries(details);
    }
    if (typeof details === 'object' && details !== null) {
      const result: Record<string, any> = {};
      for (const key in details) {
        if (details.hasOwnProperty(key)) {
          result[key] = this.convertMapToRecord(details[key]);
        }
      }
      return result;
    }
    return details;
  }
}
