import { BadRequestException, HttpException } from '@nestjs/common';
import { ErrorCode, ErrorMessages } from "./errorCode.dto";

export class AppException extends HttpException {
    constructor(errorCode: ErrorCode, details?: string | Record<string, any>) {
        const error = ErrorMessages[errorCode];
        const response = {
            errorCode,
            message: error.message,
            details: details || null,
        };

        super(response, error.httpStatus);
    }
}

export class AppValidateException extends BadRequestException {
    constructor(errorCode: ErrorCode, fieldError: Map<string, string>) {
      const error = ErrorMessages[errorCode];
      const response = {
          errorCode: errorCode ? errorCode : ErrorCode.VALIDATION_ERROR,
          message: error ? error.message : ErrorMessages[ErrorCode.VALIDATION_ERROR].message,
          details: fieldError || null,
      }
      super(response);
    }
}