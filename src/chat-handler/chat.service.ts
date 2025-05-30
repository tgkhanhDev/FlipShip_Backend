import { Injectable } from '@nestjs/common';
import { PrismaPostgresService } from 'src/prisma/prisma.service';
import { AppException } from 'src/exception/app.exception';
import { ErrorCode } from 'src/exception/errorCode.dto';
import { SendMessage } from './dto/chatRequest.dto';
import { ReceiveMessage } from './dto/chatResponse.dto';
import { ChatMapper } from '../chat-handler/mapper/chat.mapper';
import * as dayjs from 'dayjs';
import 'dayjs/plugin/utc';
import 'dayjs/plugin/timezone';

dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaPostgresService) {}

  private async validateAccount(accountID: string) {
    const account = await this.prisma.account.findUnique({
      where: { accountID },
      select: { accountID: true, fullName: true },
    });
    if (!account) throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
    return account;
  }

  async sendMessage({
    senderID,
    receiverID,
    content,
    conversationID,
  }: SendMessage): Promise<ReceiveMessage> {
    await Promise.all([
      this.validateAccount(senderID),
      this.validateAccount(receiverID),
    ]);

    let conversation = conversationID
      ? await this.prisma.conversation.findFirst({ where: { conversationID } })
      : await this.prisma.conversation.findFirst({
          where: {
            OR: [
              { accountOneID: senderID, accountTwoID: receiverID },
              { accountOneID: receiverID, accountTwoID: senderID },
            ],
          },
        });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          accountOneID: senderID,
          accountTwoID: receiverID,
          isActive: 'Active',
        },
      });
    }

    const message = await this.prisma.message.create({
      data: {
        conversationID: conversation.conversationID,
        senderID,
        receiverID,
        content,
      },
      include: {
        Account_Message_senderIDToAccount: { select: { fullName: true } },
        Account_Message_receiverIDToAccount: { select: { fullName: true } },
      },
    });

    return ChatMapper.toMessageResponse(message);
  }

  async getMessages(
    conversationID: string,
  ): Promise<ReceiveMessage[]> {
    const messages = await this.prisma.message.findMany({
      where: { conversationID },
      include: {
        Account_Message_senderIDToAccount: { select: { fullName: true } },
        Account_Message_receiverIDToAccount: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((msg) => ({
      ...ChatMapper.toMessageResponse(msg),
      createdAt: dayjs(msg.createdAt)
        .tz('Asia/Ho_Chi_Minh')
        .format('DD-MM-YYYY HH:mm'),
    }));
  }

  async getConversation(
    userID: string,
    take = 50,
    skip = 0,
  ): Promise<ReceiveMessage[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { OR: [{ accountOneID: userID }, { accountTwoID: userID }] },
      take,
      skip,
      include: {
        Message: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            Account_Message_senderIDToAccount: { select: { fullName: true } },
            Account_Message_receiverIDToAccount: { select: { fullName: true } },
          },
        },
      },
    });

    return conversations
      .filter((conv) => conv.Message.length > 0)
      .sort((a, b) => {
        const aTime = a.Message[0]?.createdAt?.getTime() ?? 0;
        const bTime = b.Message[0]?.createdAt?.getTime() ?? 0;
        return bTime - aTime;
      })
      .map((conv) => ({
        ...ChatMapper.toMessageResponse(conv.Message[0]),
        createdAt: dayjs(conv.Message[0].createdAt)
          .tz('Asia/Ho_Chi_Minh')
          .format('DD-MM-YYYY HH:mm'),
      }));
  }
}
