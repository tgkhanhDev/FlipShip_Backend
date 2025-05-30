import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationHandlerService } from './notification-handler.service';
import { CreateNotificationHandlerDto } from './dto/create-notification-handler.dto';
import { UpdateNotificationHandlerDto } from './dto/update-notification-handler.dto';

@Controller('notification-handler')
export class NotificationHandlerController {
  constructor(private readonly notificationHandlerService: NotificationHandlerService) {}

  @Post()
  create(@Body() createNotificationHandlerDto: CreateNotificationHandlerDto) {
    return this.notificationHandlerService.create(createNotificationHandlerDto);
  }

  @Get()
  findAll() {
    return this.notificationHandlerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationHandlerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationHandlerDto: UpdateNotificationHandlerDto) {
    return this.notificationHandlerService.update(+id, updateNotificationHandlerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationHandlerService.remove(+id);
  }
}
