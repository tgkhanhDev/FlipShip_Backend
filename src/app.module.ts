import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaPostgresService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { guardProviders } from './common/providers/guards.provider';
import { S3Module } from './thirdParty/s3/s3.module';
import { ApplicationPortalModule } from './application-portal/application-portal.module';
import { ExcelHandlerModule } from './excel-handler/excel-handler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AccountModule,
    S3Module,
    ApplicationPortalModule,
    ExcelHandlerModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaPostgresService, ...guardProviders],
})
export class AppModule {}
