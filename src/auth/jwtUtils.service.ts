import { Injectable } from '@nestjs/common';
import { AppException } from 'src/exception/app.exception';
import { ErrorCode } from 'src/exception/errorCode.dto';
import { JwtService } from '@nestjs/jwt';
import { AccountMapper } from '../account/mapper/account.mapper';
import * as bcrypt from 'bcrypt';
import { CreateAccountRequest } from '../account/dto/accountRequest.dto';
import { Account } from '@prisma/client';
import { AuthRequest } from './dto/authRequest.dto';
import { AccountResponse } from '../account/dto/accountResponse.dto';

@Injectable()
export class JwtUtilsService {
  constructor(
    private readonly jwtService: JwtService,
  ) {
  }

  async createToken(account: Account): Promise<string> {
    const payload = { sub: account.accountID, username: account.email, role: account.role };
    return await this.jwtService.signAsync(payload);
  }

  async decodeToken(token: string): Promise<any> {
    return await this.jwtService.decode(token);
  }

  async introspectToken(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token);
  }

  //BCrypt
  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
