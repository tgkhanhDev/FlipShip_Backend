import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaPostgresService } from 'src/prisma/prisma.service';
import { AppException } from 'src/exception/app.exception';
import { ErrorCode } from 'src/exception/errorCode.dto';
import { AccountMapper } from '../account/mapper/account.mapper';
import { AuthResponse } from './dto/authResponse.dto';
import {
  CreateAccountRequest,
  CreateCustomerAccountRequest,
  CreateDriverAccountRequest,
} from '../account/dto/accountRequest.dto';
import { AccountService } from '../account/account.service';
import { AuthRequest } from './dto/authRequest.dto';
import { AccountResponse } from '../account/dto/accountResponse.dto';
import { JwtUtilsService } from './jwtUtils.service';

@Injectable()
export class AuthService {
  private readonly accountRepository;

  constructor(
    private readonly repository: PrismaPostgresService,
    private readonly jwtService: JwtUtilsService,
    private readonly accountService: AccountService,
  ) {
    this.accountRepository = this.repository.account;
  }
  async findAll(): Promise<AccountResponse[]> {
    const accounts = await this.repository.account.findMany();
    return accounts.map((account) => AccountMapper.toAccountResponse(account));
  }

  async login(
    authRequest: AuthRequest,
  ): Promise<{ access_token: string; role: string }> {
    try {
      const user = await this.accountRepository.findUniqueOrThrow({
        where: { email: authRequest.email },
      });

      const isMatch = await this.jwtService.comparePassword(
        authRequest.password,
        user.password,
      );
      if (!isMatch) {
        throw new AppException(ErrorCode.AUTH_INVALID);
      }

      return {
        access_token: await this.jwtService.createToken(user),
        role: user.role,
      };
    } catch (error) {
      throw new AppException(ErrorCode.AUTH_INVALID);
    }
  }

  async register(
    createAccountRequest: CreateAccountRequest,
  ): Promise<AccountResponse> {
    createAccountRequest.password = await this.jwtService.hashPassword(
      createAccountRequest.password,
    );
    const response =
      await this.accountService.createAccount(createAccountRequest);
    return AccountMapper.toAccountResponse(response);
  }

  async registerCustomer(
    createCustomerAccountRequest: CreateCustomerAccountRequest,
  ): Promise<AccountResponse> {
    createCustomerAccountRequest.password = await this.jwtService.hashPassword(
      createCustomerAccountRequest.password,
    );

    const response = await this.accountService.createCustomerAccount(
      createCustomerAccountRequest,
    );

    return AccountMapper.toAccountResponse(response);
  }

  async registerDriver(
    createDriverAccountRequest: CreateDriverAccountRequest,
  ): Promise<AccountResponse> {
    createDriverAccountRequest.password = await this.jwtService.hashPassword(
      createDriverAccountRequest.password,
    );

    const response = await this.accountService.createDriverAccount(
      createDriverAccountRequest,
    );

    return AccountMapper.toAccountResponse(response);
  }

  async googleLogin(googleUser: {
    email: string;
    name: string;
    googleId: string;
  }): Promise<AuthResponse> {
    let account = await this.accountRepository.findUnique({
      where: { email: googleUser.email },
    });

    if (!account) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    return {
      access_token: await this.jwtService.createToken(account),
      role: account.role,
    };
  }
}
