import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getNotifications(@Query() filters: NotificationFiltersDto) {
    return this.notificationsService.getNotifications(filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getNotificationById(@Param('id') id: string) {
    return this.notificationsService.getNotificationById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  updateNotification(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto
  ) {
    return this.notificationsService.updateNotification(id, updateNotificationDto);
  }

  @Put(':id/read')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('mark-all-read/:recipientId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  markAllAsRead(@Param('recipientId') recipientId: string) {
    return this.notificationsService.markAllAsRead(recipientId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }

  @Get('unread-count/:recipientId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getUnreadCount(@Param('recipientId') recipientId: string) {
    return this.notificationsService.getUnreadCount(recipientId);
  }

  @Get('preferences/:userId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  getNotificationPreferences(@Param('userId') userId: string) {
    return this.notificationsService.getNotificationPreferences(userId);
  }

  @Put('preferences/:userId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER, UserRole.DEV)
  updateNotificationPreferences(
    @Param('userId') userId: string,
    @Body() preferences: any
  ) {
    return this.notificationsService.updateNotificationPreferences(userId, preferences);
  }

  @Post('outage/:outageId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  createOutageNotification(
    @Param('outageId') outageId: string,
    @Body('type') type: string,
    @Body('recipients') recipients: string[]
  ) {
    return this.notificationsService.createOutageNotification(outageId, type, recipients);
  }

  @Post('approval/:outageId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  createApprovalNotification(
    @Param('outageId') outageId: string,
    @Body('approverId') approverId: string,
    @Body('action') action: string
  ) {
    return this.notificationsService.createApprovalNotification(outageId, approverId, action);
  }

  @Post('conflict/:outageId')
  @Roles(UserRole.ADMIN, UserRole.KEY_USER)
  createConflictNotification(
    @Param('outageId') outageId: string,
    @Body('conflicts') conflicts: any[],
    @Body('recipientId') recipientId: string
  ) {
    return this.notificationsService.createConflictNotification(outageId, conflicts, recipientId);
  }
}
