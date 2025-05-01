import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ApiResponseDto<T> {
  @IsNumber()
  status: number;

  @IsString()
  @IsOptional()
  message?: string;

  @IsOptional()
  data?: T;
}
