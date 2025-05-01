import { Controller, Get, Post, Body, Patch, Param, Delete, HttpRedirectResponse, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { response, Response } from 'express';
import { ApiResponseDto } from 'src/utils/response.dto';
import { AuthResponseDto } from './dto/authResponse.dto';
import { CreateAccountRequest } from './dto/accountRequest.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAuthDto: CreateAccountRequest) {
    return await this.authService.create(createAuthDto);
  }

  @Get()
  async findAll(): Promise<ApiResponseDto<AuthResponseDto[]>> {
    const res = await this.authService.findAll()
    return {
     status: 200,
     data: res,
     message: 'success' 
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
