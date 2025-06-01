import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaPostgresService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Account, Company, Role, Customer } from '@prisma/client';
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
  private readonly companyRepository;
  private readonly customerRepository;


  constructor(
    private readonly repository: PrismaPostgresService,
  ) {
    this.accountRepository = repository.account;
    this.companyRepository = repository.company;
    this.customerRepository = repository.customer;
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

    if (await this.existsByEmail(createAccountDto.email)) {
      throw new AppException(ErrorCode.EMAIL_EXIST);
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

    if (await this.existsByEmail(createAccountDto.email)) {
      throw new AppException(ErrorCode.EMAIL_EXIST);
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
            address: createAccountDto.address,
          },
        },
      },
    });

  }

  async createDriverAccount(createDriverAccountDto: CreateDriverAccountRequest): Promise<Account> {
    const existingAccount = await this.accountRepository.findUnique({
      where: { email: createDriverAccountDto.email },
    });
    if (existingAccount) {
      throw new BadRequestException(`Email already exists: ${createDriverAccountDto.email}`);
    }

    const company: Company = await this.companyRepository.findUnique({
      where: {
        companyID: createDriverAccountDto.companyID,
      },
    });
    if (!company) throw new BadRequestException('Company does not exist');

    return await this.accountRepository.create({
      data: {
        email: createDriverAccountDto.email,
        password: createDriverAccountDto.password,
        role: 'Driver',
        Driver: {
          create: {
            vehicleType: createDriverAccountDto.vehicleType,
            phoneNumber: createDriverAccountDto.phoneNumber,
            licenseLevel: createDriverAccountDto.licenseLevel,
            fullName: createDriverAccountDto.fullName,
            identityNumber: createDriverAccountDto.identityNumber.toString(),
            licenseNumber: createDriverAccountDto.liscenseNumber,
            licenseExpiry: createDriverAccountDto.licenseExpirationDate,
            Company: {
              connect: {
                companyID: company.companyID,
              },
            },
          },
        },
      },
      select: {
        email: true,
        password: true,
        role: true,
        Driver: {
          select: {
            licenseNumber: true,
            vehicleType: true,
            licenseExpiry: true,
            phoneNumber: true,
            licenseLevel: true,
            fullName: true,
            identityNumber: true,
          },
        },
      }
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const account = await this.accountRepository.findUnique({
      where: { email },
      select: { accountID: true }, // Optimize by selecting only needed fields
    });
    if (account) {
      return true;
    }
    return false;
  }

  async findCustomerByAccountID(accountID: string): Promise<Customer | null> {
    return await this.customerRepository.findUnique({
      where: {
        accountID
      },
    })
  }

  async findCompanyByAccountID(accountID: string): Promise<Company | null> {
    return await this.companyRepository.findUnique({
      where: {
        accountID
      },
    })
  }
}
