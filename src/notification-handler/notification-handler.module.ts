import { Module } from '@nestjs/common';
import { NotificationHandlerService } from './notification-handler.service';
import { NotificationHandlerController } from './notification-handler.controller';

@Module({
  controllers: [NotificationHandlerController],
  providers: [NotificationHandlerService],
})
export class NotificationHandlerModule {}
