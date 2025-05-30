import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessage } from './dto/chatRequest.dto';
import { ReceiveMessage } from './dto/chatResponse.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userID = client.handshake.query.userID as string;
    if (userID) {
      client.join(userID);
      console.log(`Client ${client.id} tham gia phòng người dùng ${userID}`);
    }
    console.log(`Client kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ngắt kết nối: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async handleSendMessage(
    @MessageBody() payload: SendMessage,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Go');
    try {
      // Lưu tin nhắn
      const message: ReceiveMessage =
        await this.chatService.sendMessage(payload);

      // Tham gia phòng cuộc trò chuyện
      client.join(message.conversationID);
      console.log(
        `${payload.senderID} tham gia phòng ${message.conversationID}`,
      );

      // Gửi tin nhắn tới phòng cuộc trò chuyện
      client.emit('receive_message', message);
      client.to(message.conversationID).emit('receive_message', message);
      console.log(`Gửi tin nhắn tới phòng ${message.conversationID}`);

      // Thông báo cập nhật danh sách cuộc trò chuyện
      const conversationUpdate = {
        conversationID: message.conversationID,
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
        senderID: message.senderID,
        receiverID: message.receiverID,
      };

      // Gửi sự kiện tới phòng của cả người gửi và người nhận
      client
        .to(payload.senderID)
        .emit('conversation_updated', conversationUpdate);
      client
        .to(payload.receiverID)
        .emit('conversation_updated', conversationUpdate);

      // Xác nhận với người gửi
      client.emit('message_sent', message);
    } catch (error) {
      console.error(`Lỗi khi gửi tin nhắn: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { conversationID: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.conversationID) {
      client.join(data.conversationID);
      console.log(`Client tham gia phòng ${data.conversationID}`);
    } else {
      client.emit('error', { message: 'conversationID là bắt buộc' });
    }
  }

  @SubscribeMessage('join_user_room')
  handleJoinUserRoom(
    @MessageBody() data: { userID: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.userID) {
      client.join(data.userID);
      console.log(`Client tham gia phòng người dùng ${data.userID}`);
    } else {
      client.emit('error', { message: 'userID là bắt buộc' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    payload: { conversationID: string; senderID: string; receiverID: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { receiverID, conversationID, senderID } = payload;
    if (receiverID && conversationID && senderID) {
      client.to(receiverID).emit('typing', {
        conversationID,
        senderID,
      });
      console.log(`🔤 ${senderID} is typing in ${conversationID}`);
    }
  }
}
