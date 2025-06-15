import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../common/utils/constant';
import { AccountService } from '../account/account.service';
import { JwtUtilsService } from './jwtUtils.service';
import { GoogleStrategy } from './google.strategy';

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
    JwtUtilsService,
    GoogleStrategy,
  ]
})
export class AuthModule {}
