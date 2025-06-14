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
import { DeliveryOrderModule } from './delivery-order/delivery-order.module';
import { JwtUtilsService } from './auth/jwtUtils.service';
import { ImageHandlerModule } from './image-handler/image-handler.module';
import { ChatModule } from './chat-handler/chat.module';
import { NotificationHandlerModule } from './notification-handler/notification-handler.module';
import { RoutePlanningModule } from './route-planning/route-planning.module';

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
    ExcelHandlerModule,
    DeliveryOrderModule,
    ImageHandlerModule,
    ChatModule,
    NotificationHandlerModule,
    RoutePlanningModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaPostgresService, ...guardProviders],
})
export class AppModule {}
