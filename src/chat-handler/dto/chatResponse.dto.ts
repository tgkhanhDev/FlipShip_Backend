import { IsDate, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiveMessage {
  @IsUUID()
  messageID: string;

  @IsString()
  senderName: string;

  @IsUUID()
  senderID: string;

  @IsString()
  receiverName: string;

  @IsUUID()
  receiverID: string;

  @IsString()
  content: string;

  createdAt: string;

  @IsUUID()
  @IsOptional()
  conversationID: string;
}
