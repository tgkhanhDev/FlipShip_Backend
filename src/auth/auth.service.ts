import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaPostgresService } from 'src/prisma/prisma.service';
import { AppException } from 'src/exception/app.exception';
import { ErrorCode } from 'src/exception/errorCode.dto';
import { AuthResponseDto } from './dto/authResponse.dto';
import { AccountMapper } from './entities/auth.entity';
import { CreateAccountRequest } from './dto/accountRequest.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: PrismaPostgresService,
    private readonly jwtService: JwtService
  ) { }

  create(createAccountRequest: CreateAccountRequest) {
    return 'This action adds a new auth';
  }

  async findAll(): Promise<AuthResponseDto[]> {
    const accounts = await this.repository.account.findMany();
    return accounts.map((account) => AccountMapper.toAuthResponseDto(account));
  }

  findOne(id: number) {
    throw new AppException(ErrorCode.USER_NOT_FOUND);
    // return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async login(createAccountRequest: CreateAccountRequest): Promise<{access_token: string}> {
    //Nên gọi từ module
    const user = await this.repository.account.findFirst({
      where: {
        email: createAccountRequest.email,
        password: createAccountRequest.password
      }
    });

    if (!user) {
      throw new AppException(ErrorCode.USER_NOT_FOUND);
    }

    const payload = { sub: user.accountID, username: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
