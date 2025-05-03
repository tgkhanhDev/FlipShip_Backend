import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpRedirectResponse,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/common/utils/response.dto';
import { AuthResponse } from './dto/authResponse.dto';
import { Public, RoleMatch } from 'src/common/utils/metadata';
import { Role } from '@prisma/client';
import { CreateAccountRequest } from '../account/dto/accountRequest.dto';
import { AuthRequest } from './dto/authRequest.dto';
import { AccountResponse } from '../account/dto/accountResponse.dto';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/registration")
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() createAuth: CreateAccountRequest): Promise<ApiResponse<AccountResponse>> {
    return ApiResponse.build<AccountResponse>(
      HttpStatus.CREATED,
      await this.authService.register(createAuth),
      "Tạo tài khoản thành công");
  }

  @Post("/login")
  async signIn(@Body() authRequest: AuthRequest ):Promise<ApiResponse<AuthResponse>> {
    return ApiResponse.build<AuthResponse>(
      HttpStatus.OK,
      await this.authService.login(authRequest),
      "Đăng nhập thành công"
    )
  }

}
