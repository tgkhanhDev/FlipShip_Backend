import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NotificationService } from './notification-handler.service';
import { CreateNotificationHandlerDto } from './dto/create-notification-handler.dto';
import { UpdateNotificationHandlerDto } from './dto/update-notification-handler.dto';
import { sendNotificationDTO } from './dto/send-notification.dto';

@Controller('notification-handler')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async sendNotification(@Body() pushNotification: sendNotificationDTO) {
    return await this.notificationService.sendPush(pushNotification);
  }

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationHandlerDto,
  ) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}
