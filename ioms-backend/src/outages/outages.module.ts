// src/outages/outages.module.ts
import { Module } from '@nestjs/common';
import { OutagesService } from './outages.service';
import { OutagesController } from './outages.controller';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [OutagesController],
  providers: [OutagesService],
  exports: [OutagesService],
})
export class OutagesModule {}