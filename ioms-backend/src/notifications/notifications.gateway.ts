import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, OnModuleInit } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
@UseGuards(WsJwtGuard)
export class NotificationsGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    // Registrar este gateway no service
    this.notificationsService.setGateway(this);
    
    // Escutar eventos do NotificationsService
    this.notificationsService.on('notificationCreated', (notification) => {
      this.handleNewNotification(notification);
    });
  }

  afterInit(server: Server) {
    console.log('Notifications WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Autenticar o usuário via token JWT
      const token = client.handshake.auth.token || 
                   client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        console.log('No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.user = payload;

      // Adicionar usuário à lista de conectados
      this.connectedUsers.set(payload.sub, client.id);

      console.log(`User ${payload.sub} connected to notifications`);

      // Enviar contador de notificações não lidas
      try {
        const unreadCount = await this.notificationsService.getUnreadCount(payload.sub);
        client.emit('unread_count', { count: unreadCount });
      } catch (error) {
        console.error('Error getting unread count:', error);
      }

    } catch (error) {
      console.error('WebSocket authentication error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`User ${client.userId} disconnected from notifications`);
    }
  }

  private handleNewNotification(notification: any) {
    const recipientSocketId = this.connectedUsers.get(notification.userId);
    
    if (recipientSocketId) {
      const socket = this.server.sockets.sockets.get(recipientSocketId);
      if (socket) {
        // Enviar notificação específica
        socket.emit('new_notification', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          data: notification.data,
          createdAt: notification.createdAt
        });

        // Atualizar contador de não lidas
        socket.emit('unread_count_updated', { increment: 1 });
        
        console.log(`Notification sent to user ${notification.userId}`);
      }
    } else {
      console.log(`User ${notification.userId} not connected, notification queued`);
    }
  }

  // Método para enviar contador atualizado quando notificações são lidas
  async notifyReadCountUpdate(userId: string, decrement = 1) {
    const socketId = this.connectedUsers.get(userId);
    
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('unread_count_updated', { decrement });
      }
    }
  }

  // Método para resetar contador quando todas são marcadas como lidas
  async notifyAllRead(userId: string) {
    const socketId = this.connectedUsers.get(userId);
    
    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('all_read');
      }
    }
  }
}
