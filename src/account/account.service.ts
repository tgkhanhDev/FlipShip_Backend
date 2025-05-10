import { Injectable } from '@nestjs/common';
import { PrismaPostgresService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Account } from '@prisma/client';
import {
  CreateAccountRequest,
  CreateCustomerAccountRequest,
  CreateDriverAccountRequest,
} from './dto/accountRequest.dto';
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
    });
  }

  async createCustomerAccount(createAccountDto: CreateCustomerAccountRequest): Promise<Account> {

    if( await this.existsByEmail(createAccountDto.email) ) {
      throw new AppException(ErrorCode.EMAIL_EXIST)
    }

    return await this.accountRepository.create({
      data: {
        email: createAccountDto.email,
        password: createAccountDto.password,
        role: 'Customer',
        Customer: {
          create: {
            fullName: createAccountDto.fullName,
            phoneNumber: createAccountDto.phoneNumber,
            address: createAccountDto.address
          }
        }
      }
    })

  }

  async createDriverAccount(createDriverAccountDto: CreateDriverAccountRequest): Promise<Account> {
    if( await this.existsByEmail(createDriverAccountDto.email) ) {
      throw new AppException(ErrorCode.EMAIL_EXIST)
    }

    return await this.accountRepository.create({
      data: {
        email: createDriverAccountDto.email,
        password: createDriverAccountDto.password,
        role: 'Driver',
        Driver: {
          create: {
            // company: createDriverAccountDto.companyName,
            vehicleType: createDriverAccountDto.vehicleType,
            licenseNumber: createDriverAccountDto.liscenseNumber,
            licenseExpiry: createDriverAccountDto.licenseExpirationDate
          }
        }
      }
    })
  }


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
