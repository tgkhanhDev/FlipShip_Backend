import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ApiResponse<T> {
  @IsNumber()
  status: number;

  @IsString()
  @IsOptional()
  message?: string;

  @IsOptional()
  data?: T;

  constructor(status: number, data?: T, message?: string) {
    this.status = status;
    this.data = data;
    this.message = message;
  }

  static build<T>(status: number, data?: T, message?: string): ApiResponse<T> {
    return new ApiResponse<T>(status, data, message);
  }
}

export class PaginationResponse<T> {
  @IsNumber()
  status: number;

  @IsString()
  @IsOptional()
  message?: string;

  @IsOptional()
  data?: T;

  @IsNumber()
  page?: number;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsNumber()
  limit?: number;

  constructor(status: number, data?: T, message?: string, page?: number, total?: number, limit?: number) {
    this.status = status;
    this.data = data;
    this.message = message;
    this.page = page;
    this.total = total;
    this.limit = limit;
  }

  static build<T>(status: number, data?: T, message?: string, page?: number, total?: number, limit?: number): PaginationResponse<T> {
    return new PaginationResponse<T>(status, data, message, page, total, limit);
  }
}

export interface PaginationParams {
  page: number;
  limit: number;
}
