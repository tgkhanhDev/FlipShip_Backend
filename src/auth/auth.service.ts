import { Injectable } from '@nestjs/common';
import { PrismaPostgresService } from 'src/prisma/prisma.service';
import { AppException } from 'src/exception/app.exception';
import { ErrorCode } from 'src/exception/errorCode.dto';
import { JwtService } from '@nestjs/jwt';
import { AccountMapper } from '../account/mapper/account.mapper';
import * as bcrypt from 'bcrypt';
import { AuthResponse } from './dto/authResponse.dto';
import { CreateAccountRequest } from '../account/dto/accountRequest.dto';
import { AccountService } from '../account/account.service';
import { Account } from '@prisma/client';
import { AuthRequest } from './dto/authRequest.dto';
import { AccountResponse } from '../account/dto/accountResponse.dto';

@Injectable()
export class AuthService {
  private readonly accountRepository;

  constructor(
    private readonly repository: PrismaPostgresService,
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
  ) {
    this.accountRepository = this.repository.account;
  }

  create(createAccountRequest: CreateAccountRequest) {
    return 'This action adds a new auth';
  }

  async findAll(): Promise<AccountResponse[]> {
    const accounts = await this.repository.account.findMany();
    return accounts.map((account) => AccountMapper.toAccountResponse(account));
  }

  findOne(id: number) {
    throw new AppException(ErrorCode.USER_NOT_FOUND);
    // return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  //TODO: ===========================================
  async login(authRequest: AuthRequest): Promise<{access_token: string}> {
    //Nên gọi từ module
    try {
      const user = await this.accountRepository.findUniqueOrThrow({
        where: { email: authRequest.email },
      });

      const isMatch = await this.comparePassword(authRequest.password, user.password);
      if (!isMatch) {
        throw new AppException(ErrorCode.AUTH_INVALID)
      }

      const payload = { sub: user.accountID, username: user.email, role: user.role };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new AppException(ErrorCode.AUTH_INVALID)
    }
  }

  async register(createAccountRequest: CreateAccountRequest): Promise<AccountResponse> {
    createAccountRequest.password = await this.hashPassword(createAccountRequest.password);
    const response = await this.accountService.createAccount(createAccountRequest)
    return AccountMapper.toAccountResponse(response);

  }

  //Private function
  private async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
