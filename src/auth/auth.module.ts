import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../common/utils/constant';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { AccountService } from '../account/account.service';
import { JwtUtilsService } from './jwtUtils.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '72000s' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccountService,
    JwtUtilsService
  ]
})
export class AuthModule {}
