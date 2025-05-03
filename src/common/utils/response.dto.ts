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
