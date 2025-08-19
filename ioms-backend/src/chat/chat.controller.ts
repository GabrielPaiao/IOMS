import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ===== CONVERSAS =====

  @Post('conversations')
  createConversation(@Request() req, @Body() createConversationDto: CreateConversationDto) {
    return this.chatService.createConversation(req.user.id, createConversationDto);
  }

  @Get('conversations')
  getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  getConversationById(@Request() req, @Param('id') id: string) {
    return this.chatService.getConversationById(req.user.id, id);
  }

  @Patch('conversations/:id')
  updateConversation(
    @Request() req,
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.chatService.updateConversation(req.user.id, id, updateConversationDto);
  }

  @Delete('conversations/:id')
  deleteConversation(@Request() req, @Param('id') id: string) {
    return this.chatService.deleteConversation(req.user.id, id);
  }

  // ===== MENSAGENS =====

  @Post('messages')
  createMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.chatService.createMessage(req.user.id, createMessageDto);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Request() req,
    @Param('id') conversationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.chatService.getMessages(
      req.user.id,
      conversationId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Delete('messages/:id')
  deleteMessage(@Request() req, @Param('id') id: string) {
    return this.chatService.deleteMessage(req.user.id, id);
  }

  // ===== FUNCIONALIDADES ADICIONAIS =====

  @Post('conversations/:id/read')
  markConversationAsRead(@Request() req, @Param('id') id: string) {
    return this.chatService.markConversationAsRead(req.user.id, id);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.chatService.getUnreadCount(req.user.id);
  }

  @Get('search')
  searchMessages(
    @Request() req,
    @Query('q') query: string,
    @Query('conversationId') conversationId?: string,
  ) {
    return this.chatService.searchMessages(req.user.id, query, conversationId);
  }

  // ===== CONVERSAS RELACIONADAS =====

  @Get('outages/:id/conversation')
  getOutageConversation(@Param('id') outageId: string) {
    return this.chatService.getOutageConversation(outageId);
  }

  @Get('applications/:id/conversation')
  getApplicationConversation(@Param('id') applicationId: string) {
    return this.chatService.getApplicationConversation(applicationId);
  }

  // ===== ADMIN ENDPOINTS =====

  @Get('admin/conversations')
  @Roles('ADMIN')
  getAllConversations() {
    // TODO: Implementar para admins
    return { message: 'Admin endpoint - implementar' };
  }

  @Get('admin/messages')
  @Roles('ADMIN')
  getAllMessages() {
    // TODO: Implementar para admins
    return { message: 'Admin endpoint - implementar' };
  }
}
