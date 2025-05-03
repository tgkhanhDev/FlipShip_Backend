import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AccountResponse {
  @ApiProperty({ description: 'Unique identifier for the account', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  accountID: string;

  @ApiProperty({ description: 'Email address of the account', example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Status of the account', example: 'active', nullable: true })
  @IsString()
  @IsOptional()
  status?: string | null;
}