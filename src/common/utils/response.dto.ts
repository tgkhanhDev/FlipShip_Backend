import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ApiResponse<T> {
  @IsNumber()
  status: number;

  @IsString()
  @IsOptional()
  message?: string;

  @IsOptional()
  data?: T;

  //Pagination
  @IsOptional()
  page: number;
  @IsOptional()
  limit: number;


  constructor(status: number, data?: T, message?: string) {
    this.status = status;
    this.data = data;
    this.message = message;
  }

  static build<T>(status: number, data?: T, message?: string): ApiResponse<T> {
    return new ApiResponse<T>(status, data, message);
  }

  // static buildPagination<T>(status: number, data?: T, message?: string, page: number, limit: number): ApiResponse<T> {
  //   return new ApiResponse<T>(status, data, message, page, limit);
  //
  // }
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export class PaginationResponse<T> {

}
