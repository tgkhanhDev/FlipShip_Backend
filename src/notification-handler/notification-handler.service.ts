import { Injectable } from '@nestjs/common';
import { CreateNotificationHandlerDto } from './dto/create-notification-handler.dto';
import { UpdateNotificationHandlerDto } from './dto/update-notification-handler.dto';
import { sendNotificationDTO } from './dto/send-notification.dto';
import * as firebase from 'firebase-admin';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class NotificationService {
  async sendPush(notification: sendNotificationDTO) {
    const sentAt = dayjs().tz('Asia/Ho_Chi_Minh').toISOString();

    try {
      const response = await firebase.messaging().sendEachForMulticast({
        notification: {
          title: notification.title,
          body: notification.body,
        },
        tokens: notification.deviceIds,
        data: {
          sentAt,
        },
      });

      return {
        success: true,
        payload: {
          title: notification.title,
          body: notification.body,
          deviceIds: notification.deviceIds,
          sentAt,
        },
        summary: {
          successCount: response.successCount,
          failureCount: response.failureCount,
        },
        responses: response.responses.map((r, idx) => ({
          token: notification.deviceIds[idx],
          success: r.success,
          error: r.error?.message || null,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  create(createNotificationHandlerDto: CreateNotificationHandlerDto) {
    return 'This action adds a new notification';
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationHandlerDto: UpdateNotificationHandlerDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
