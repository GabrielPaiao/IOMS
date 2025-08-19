import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    const { recipientId, type, title, message, priority, metadata } = createNotificationDto;

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: recipientId }
    });

    if (!user) {
      throw new NotFoundException('Recipient user not found');
    }

    // Criar notificação
    const notification = await this.prisma.notification.create({
      data: {
        userId: recipientId,
        type,
        title,
        message,
        data: metadata,
        isRead: false
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    // Aqui você pode implementar o envio de notificações em tempo real
    // via WebSocket, email, push notification, etc.
    await this.sendRealTimeNotification(notification);

    return notification;
  }

  async getNotifications(filters: NotificationFiltersDto) {
    const where: any = {};

    if (filters.read !== undefined) {
      where.read = filters.read;
    }

    if (filters.type) {
      where.type = { in: filters.type };
    }

    if (filters.priority) {
      where.priority = { in: filters.priority };
    }

    if (filters.recipientId) {
      where.userId = filters.recipientId;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page ?? 1) - 1) * (filters.limit ?? 10),
        take: filters.limit ?? 10
      }),
      this.prisma.notification.count({ where })
    ]);

    return {
      notifications,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }

  async getNotificationById(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async updateNotification(id: string, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    return updatedNotification;
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  async markAllAsRead(recipientId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId: recipientId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });

    return { updatedCount: result.count };
  }

  async deleteNotification(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id }
    });

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(recipientId: string) {
    return this.prisma.notification.count({
      where: { userId: recipientId, isRead: false }
    });
  }

  async getNotificationPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.email || this.getDefaultPreferences();
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Atualizar preferências do usuário
    await this.prisma.user.update({
      where: { id: userId },
      data: { email: preferences }
    });

    return preferences;
  }

  async createOutageNotification(outageId: string, type: string, recipients: string[]) {
    const outage = await this.prisma.outage.findUnique({
      where: { id: outageId },
      include: {
        application: { select: { name: true } },
        location: { select: { name: true } },
        requester: { select: { firstName: true, lastName: true } }
      }
    });

    if (!outage) {
      throw new NotFoundException('Outage not found');
    }

    const notifications = [];

    for (const recipientId of recipients) {
      const notification = await this.createNotification({
        recipientId,
        type,
        title: `Outage ${type}: ${outage.reason}`,
        message: `Outage "${outage.reason}" for ${outage.application.name} has been ${type}`,
        priority: outage.criticality === 'CRITICAL' ? 'high' : 'normal',
        metadata: {
          outageId,
          applicationName: outage.application.name,
          locationName: outage.location.name,
          criticality: outage.criticality,
          requester: `${outage.requester.firstName} ${outage.requester.lastName}`
        }
      });

      notifications.push(notification);
    }

    return notifications;
  }

  async createApprovalNotification(outageId: string, approverId: string, action: string) {
    const outage = await this.prisma.outage.findUnique({
      where: { id: outageId },
      include: {
        application: { select: { name: true } },
        requester: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    if (!outage) {
      throw new NotFoundException('Outage not found');
    }

    const notification = await this.createNotification({
      recipientId: outage.requester.id,
      type: 'approval_update',
      title: `Outage ${action}: ${outage.reason}`,
      message: `Your outage request "${outage.reason}" for ${outage.application.name} has been ${action}`,
      priority: 'normal',
      metadata: {
        outageId,
        action,
        applicationName: outage.application.name,
        approverId
      }
    });

    return notification;
  }

  async createConflictNotification(outageId: string, conflicts: any[], recipientId: string) {
    const outage = await this.prisma.outage.findUnique({
      where: { id: outageId },
      include: {
        application: { select: { name: true } },
        location: { select: { name: true } }
      }
    });

    if (!outage) {
      throw new NotFoundException('Outage not found');
    }

    const notification = await this.createNotification({
      recipientId,
      type: 'conflict_detected',
      title: `Conflicts detected in outage: ${outage.reason}`,
      message: `${conflicts.length} conflict(s) detected for outage "${outage.reason}" in ${outage.application.name}`,
      priority: 'high',
      metadata: {
        outageId,
        conflictCount: conflicts.length,
        conflicts: conflicts.map(c => ({
          type: c.conflictType,
          severity: c.severity,
          description: c.description
        }))
      }
    });

    return notification;
  }

  private async sendRealTimeNotification(notification: any) {
    // Implementar envio de notificação em tempo real
    // Por exemplo, via WebSocket, Server-Sent Events, ou similar
    console.log(`Real-time notification sent: ${notification.title}`);
  }

  private getDefaultPreferences() {
    return {
      email: true,
      push: true,
      sms: false,
      outageUpdates: true,
      approvalRequests: true,
      conflictAlerts: true,
      reminders: true
    };
  }
}
