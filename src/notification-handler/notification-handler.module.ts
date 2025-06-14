import { Module } from '@nestjs/common';
import { NotificationService } from './notification-handler.service';
import { firebaseAdminProvider } from './firebase-admin.provider';
import { NotificationController } from './notification-handler.controller';

@Module({
  controllers: [NotificationController],
  providers: [firebaseAdminProvider, NotificationService],
})
export class NotificationHandlerModule {}
