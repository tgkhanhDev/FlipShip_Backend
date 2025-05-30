import { Company, Coordinator, Customer, Account } from '@prisma/client';
import { ReceiveMessage } from '../dto/chatResponse.dto';

//Mapper
export class ChatMapper {
  static toMessageResponse(message: any): ReceiveMessage {
    return {
      messageID: message.messageID,
      senderName: message.Account_Message_senderIDToAccount?.fullName || '',
      senderID: message.senderID,
      receiverName: message.Account_Message_receiverIDToAccount?.fullName || '',
      receiverID: message.receiverID,
      content: message.content,
      createdAt: message.createdAt,
      conversationID: message.conversationID,
    };
  }
}
