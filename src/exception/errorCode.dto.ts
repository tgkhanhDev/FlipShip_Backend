import { HttpStatus } from "@nestjs/common";

export enum ErrorCode {
    //Internal Server
    SERVER_ERROR = 'SERVER_ERROR',

    //Validation
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTH_INVALID = 'AUTH_INVALID',

    // In App
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    EMAIL_EXIST = 'EMAIL_EXIST',
    ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    INVALID_USERNAME_OR_PASSWORD = 'INVALID_USERNAME_OR_PASSWORD',
    //Files
    FILE_INVALID = 'FILE_INVALID',
    EXCEL_HEADERS_INVALID = 'EXCEL_HEADERS_INVALID',
    // Add more as needed
}

export const ErrorMessages: Record<ErrorCode, { message: string; httpStatus: number }> = {

    //Internal Server
    [ErrorCode.SERVER_ERROR]: {
        message: 'Internal Server Error',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    },

    //Validation
    [ErrorCode.VALIDATION_ERROR]: {
        message: 'Trường dữ liệu không hợp lệ',
        httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.AUTH_INVALID]: {
        message: 'Thông tin đăng nhập không hợp lệ',
        httpStatus: HttpStatus.BAD_REQUEST,
    },

    // In App
    [ErrorCode.USER_NOT_FOUND]: {
        message: 'Người dùng không tồn tại',
        httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.EMAIL_EXIST]: {
        message: 'Email đã có người sử dụng',
        httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.ACCOUNT_NOT_FOUND]: {
        message: 'Tài khoản không tồn tại',
        httpStatus: HttpStatus.NOT_FOUND,
    },
    [ErrorCode.INVALID_CREDENTIALS]: {
        message: 'Invalid credentials',
        httpStatus: HttpStatus.UNAUTHORIZED,
    },
    [ErrorCode.INVALID_USERNAME_OR_PASSWORD]: {
        message: 'Tài khoản hoặc mật khẩu không hợp lệ',
        httpStatus: HttpStatus.UNAUTHORIZED,
    },

    //Files
    [ErrorCode.FILE_INVALID]: {
        message: 'File khöng hợp lệ',
        httpStatus: HttpStatus.BAD_REQUEST,
    },
    [ErrorCode.EXCEL_HEADERS_INVALID]: {
        message: 'Format của Excel khöng hợp lệ',
        httpStatus: HttpStatus.BAD_REQUEST,
    }

};