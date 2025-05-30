import { Injectable } from '@nestjs/common';
import { CreateNotificationHandlerDto } from './dto/create-notification-handler.dto';
import { UpdateNotificationHandlerDto } from './dto/update-notification-handler.dto';

@Injectable()
export class NotificationHandlerService {
  create(createNotificationHandlerDto: CreateNotificationHandlerDto) {
    return 'This action adds a new notificationHandler';
  }

  findAll() {
    return `This action returns all notificationHandler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notificationHandler`;
  }

  update(id: number, updateNotificationHandlerDto: UpdateNotificationHandlerDto) {
    return `This action updates a #${id} notificationHandler`;
  }

  remove(id: number) {
    return `This action removes a #${id} notificationHandler`;
  }
}
