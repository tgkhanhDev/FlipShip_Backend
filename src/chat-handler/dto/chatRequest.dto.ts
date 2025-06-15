import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class SendMessage {
  @IsUUID()
  @IsNotEmpty({ message: 'SenderID is required' })
  senderID: string;

  @IsUUID()
  @IsNotEmpty({ message: 'ReceiverID is required' })
  receiverID: string;

  @IsNotEmpty({ message: 'ConversationID is required' })
  @IsUUID()
  conversationID?: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString()
  content: string;
}
