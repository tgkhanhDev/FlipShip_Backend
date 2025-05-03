import { Injectable } from '@nestjs/common';
import { PrismaPostgresService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Account } from '@prisma/client';
import { CreateAccountRequest } from './dto/accountRequest.dto';
import { AppException } from '../exception/app.exception';
import { ErrorCode } from '../exception/errorCode.dto';
import { UuidFactory } from '@nestjs/core/inspector/uuid-factory';

@Injectable()
export class AccountService {
  private readonly accountRepository;

  constructor(
    private readonly repository: PrismaPostgresService,
  ) {
    this.accountRepository = repository.account;
  }

  findAll() {
    return `This action returns all account`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  async createAccount(createAccountDto: CreateAccountRequest): Promise<Account> {

   if( await this.existsByEmail(createAccountDto.email) ) {
     throw new AppException(ErrorCode.EMAIL_EXIST)
   }

    return this.accountRepository.create({
      data: {
        email: createAccountDto.email,
        password: createAccountDto.password,
        role: 'Customer',
      },
    });  }


  //TODO: === Private ===

  private async findAccountByEmail(email: string): Promise<Account> {
    try {
      return await this.accountRepository.findUniqueOrThrow({
        where: { email },
      });
    } catch (error) {
      throw new AppException(ErrorCode.AUTH_INVALID)
    }
  }

  private async existsByEmail(email: string): Promise<boolean> {
    const account = await this.accountRepository.findUnique({
      where: { email },
      select: { accountID: true }, // Optimize by selecting only needed fields
    });
    if(account){
      return true
    }
    return false;
  }
}
