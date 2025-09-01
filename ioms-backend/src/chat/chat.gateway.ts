import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    console.log('Chat WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Autenticar o usuário via token JWT
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.user = payload;

      // Adicionar usuário à lista de conectados
      this.connectedUsers.set(payload.sub, client.id);

      // Juntar o usuário às salas das suas conversas
      const conversations = await this.chatService.getConversations(payload.sub);
      conversations.forEach(conversation => {
        client.join(`conversation:${conversation.id}`);
      });

      // Notificar outros usuários sobre a conexão
      client.broadcast.emit('user:connected', {
        userId: payload.sub,
        user: {
          id: payload.sub,
          firstName: payload.firstName,
          lastName: payload.lastName,
        },
      });

      // Log para capturar todos os eventos
      client.onAny((eventName, ...args) => {
        console.log(`[WEBSOCKET] Received event "${eventName}" from user ${client.userId}:`, args);
      });

      console.log(`User ${payload.sub} connected to chat`);
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Remover usuário da lista de conectados
      this.connectedUsers.delete(client.userId);

      // Notificar outros usuários sobre a desconexão
      client.broadcast.emit('user:disconnected', {
        userId: client.userId,
        user: client.user,
      });

      console.log(`User ${client.userId} disconnected from chat`);
    }
  }

  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      console.log(`User ${client.userId} joining conversation ${data.conversationId}`);
      
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Verificar se o usuário é participante da conversa
      const conversation = await this.chatService.getConversationById(client.userId, data.conversationId);
      
      // Juntar à sala da conversa
      client.join(`conversation:${data.conversationId}`);
      console.log(`User ${client.userId} joined room conversation:${data.conversationId}`);
      
      // Marcar conversa como lida
      await this.chatService.markConversationAsRead(client.userId, data.conversationId);

      // Notificar outros participantes
      client.to(`conversation:${data.conversationId}`).emit('conversation:userJoined', {
        userId: client.userId,
        user: client.user,
        conversationId: data.conversationId,
      });

      return { success: true, message: 'Joined conversation' };
    } catch (error) {
      console.error('Error joining conversation:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      console.log(`User ${client.userId} leaving conversation ${data.conversationId}`);
      
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Sair da sala da conversa
      client.leave(`conversation:${data.conversationId}`);
      console.log(`User ${client.userId} left room conversation:${data.conversationId}`);

      // Notificar outros participantes
      client.to(`conversation:${data.conversationId}`).emit('conversation:userLeft', {
        userId: client.userId,
        user: client.user,
        conversationId: data.conversationId,
      });

      return { success: true, message: 'Left conversation' };
    } catch (error) {
      console.error('Error leaving conversation:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Criar a mensagem no banco de dados
      const message = await this.chatService.createMessage(client.userId, createMessageDto);

      // Enviar a mensagem para todos os participantes da conversa
      this.server.to(`conversation:${createMessageDto.conversationId}`).emit('message:received', {
        ...message,
        isOwn: false,
      });

      // Enviar confirmação para o remetente
      client.emit('message:sent', {
        ...message,
        isOwn: true,
      });

      // Notificar sobre nova mensagem (para notificações push)
      this.server.to(`conversation:${createMessageDto.conversationId}`).emit('conversation:newMessage', {
        conversationId: createMessageDto.conversationId,
        message: {
          id: message.id,
          content: message.content,
          user: message.user,
          createdAt: message.createdAt,
        },
      });

      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('message:typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    // Notificar outros participantes sobre digitação
    client.to(`conversation:${data.conversationId}`).emit('message:userTyping', {
      userId: client.userId,
      user: client.user,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @MessageBody() data: { conversationId: string; messageIds: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Marcar mensagens como lidas
      await this.chatService.markConversationAsRead(client.userId, data.conversationId);

      // Notificar outros participantes
      client.to(`conversation:${data.conversationId}`).emit('message:read', {
        userId: client.userId,
        user: client.user,
        conversationId: data.conversationId,
        messageIds: data.messageIds,
      });

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('conversation:create')
  async handleCreateConversation(
    @MessageBody() createConversationDto: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Criar a conversa
      const conversation = await this.chatService.createConversation(client.userId, createConversationDto);

      // Juntar todos os participantes às salas
      conversation.participants.forEach(participant => {
        const socketId = this.connectedUsers.get(participant.userId);
        if (socketId) {
          this.server.sockets.sockets.get(socketId)?.join(`conversation:${conversation.id}`);
        }
      });

      // Notificar todos os participantes sobre a nova conversa
      this.server.to(`conversation:${conversation.id}`).emit('conversation:created', conversation);

      return { success: true, conversation };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('conversation:update')
  async handleUpdateConversation(
    @MessageBody() data: { conversationId: string; updates: any },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Atualizar a conversa
      const conversation = await this.chatService.updateConversation(
        client.userId,
        data.conversationId,
        data.updates,
      );

      // Notificar todos os participantes sobre a atualização
      this.server.to(`conversation:${data.conversationId}`).emit('conversation:updated', conversation);

      return { success: true, conversation };
    } catch (error) {
      console.error('Error updating conversation:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('conversation:delete')
  async handleDeleteConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        throw new Error('User not authenticated');
      }

      // Excluir a conversa
      await this.chatService.deleteConversation(client.userId, data.conversationId);

      // Notificar todos os participantes sobre a exclusão
      this.server.to(`conversation:${data.conversationId}`).emit('conversation:deleted', {
        conversationId: data.conversationId,
      });

      // Remover todos da sala
      this.server.in(`conversation:${data.conversationId}`).socketsLeave(`conversation:${data.conversationId}`);

      return { success: true };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos utilitários para uso externo
  sendMessageToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  sendMessageToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }

  sendMessageToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
