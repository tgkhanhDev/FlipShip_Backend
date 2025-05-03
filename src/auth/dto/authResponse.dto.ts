// dtos/account-response.dto.ts
import { IsString, IsUUID, IsOptional, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
    @IsString()
    access_token: string;
}