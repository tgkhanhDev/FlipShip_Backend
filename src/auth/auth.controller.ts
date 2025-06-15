import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Res
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/common/utils/response.dto';
import { AuthResponse } from './dto/authResponse.dto';
import { Public } from 'src/common/utils/metadata';
import {
  CreateAccountRequest,
  CreateCustomerAccountRequest,
  CreateDriverAccountRequest,
} from '../account/dto/accountRequest.dto';
import { AuthRequest } from './dto/authRequest.dto';
import { AccountResponse } from '../account/dto/accountResponse.dto';
import { GoogleStrategy } from './google.strategy';

@Controller('auth')
@Public()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleStrategy: GoogleStrategy,
  ) {}

  @Post('/registration')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() createAuth: CreateAccountRequest,
  ): Promise<ApiResponse<AccountResponse>> {
    return ApiResponse.build<AccountResponse>(
      HttpStatus.CREATED,
      await this.authService.register(createAuth),
      'Tạo tài khoản thành công',
    );
  }

  @Post('/login')
  async signIn(
    @Body() authRequest: AuthRequest,
  ): Promise<ApiResponse<AuthResponse>> {
    return ApiResponse.build<AuthResponse>(
      HttpStatus.OK,
      await this.authService.login(authRequest),
      'Đăng nhập thành công',
    );
  }

  @Post('/register-customer')
  @HttpCode(HttpStatus.CREATED)
  async signUpCustomer(
    @Body() createCustomerAccount: CreateCustomerAccountRequest,
  ): Promise<ApiResponse<AccountResponse>> {
    return ApiResponse.build<AccountResponse>(
      HttpStatus.CREATED,
      await this.authService.registerCustomer(createCustomerAccount),
      'Tạo tài khoản thành công',
    );
  }

  @Post('/register-driver')
  @HttpCode(HttpStatus.CREATED)
  async signUpDriver(
    @Body() createDriverAccount: CreateDriverAccountRequest,
  ): Promise<ApiResponse<AccountResponse>> {
    return ApiResponse.build<AccountResponse>(
      HttpStatus.CREATED,
      await this.authService.registerDriver(createDriverAccount),
      'Tạo tài khoản thành công',
    );
  }

  @Get('google')
  async googleAuth(@Query('code') code?: string): Promise<ApiResponse<any>> {
    if (!code) {
      const authUrl = this.googleStrategy.getAuthUrl();
      return ApiResponse.build(
        HttpStatus.OK,
        { authUrl },
        'URL xác thực Google',
      );
    }

    const user = await this.googleStrategy.validate(code);
    const authResponse = await this.authService.googleLogin(user);
    return ApiResponse.build<AuthResponse>(
      HttpStatus.OK,
      authResponse,
      'Đăng nhập Google thành công',
    );
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: any) {
    res.send(`
      <script>
        window.opener.postMessage({ code: "${code}" }, "http://localhost:3000");
        window.close();
      </script>
    `);
  }
}
