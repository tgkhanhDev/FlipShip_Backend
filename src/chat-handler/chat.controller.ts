import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiResponse } from 'src/common/utils/response.dto';
import { SendMessage } from './dto/chatRequest.dto';
import { ReceiveMessage } from './dto/chatResponse.dto';
import { Public } from 'src/common/utils/metadata';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
@Public()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a new message' })
  async sendMessage(
    @Body() createMessage: SendMessage,
  ): Promise<ApiResponse<ReceiveMessage>> {
    const message = await this.chatService.sendMessage(createMessage);
    return ApiResponse.build<ReceiveMessage>(HttpStatus.CREATED, message);
  }

  @Get('/:conversationId')
  @ApiOperation({ summary: 'Get message history between two users' })
  @ApiParam({ name: 'conversationId', description: 'UUID of the conversation' })
  async getMessages(
    @Param('conversationId') conversationId: string,
  ): Promise<ApiResponse<ReceiveMessage[]>> {
    const messages = await this.chatService.getMessages(conversationId);
    return ApiResponse.build<ReceiveMessage[]>(HttpStatus.OK, messages);
  }

  @Get('/conversation/:userId')
  @ApiOperation({ summary: 'Get all conversation by user ID' })
  @ApiParam({ name: 'userId', description: 'UUID of the conversation' })
  async getConversation(
    @Param('userId') userId: string,
  ): Promise<ApiResponse<ReceiveMessage[]>> {
    const messages = await this.chatService.getConversation(userId);
    return ApiResponse.build<ReceiveMessage[]>(HttpStatus.OK, messages);
  }
}
