import { PartialType } from '@nestjs/swagger';
import { CreateNotificationHandlerDto } from './create-notification-handler.dto';

export class UpdateNotificationHandlerDto extends PartialType(CreateNotificationHandlerDto) {}
