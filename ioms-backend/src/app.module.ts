import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { MailModule } from './mail/mail.module';
import { OutagesModule } from './outages/outages.module';
import { ApprovalWorkflowsModule } from './approval-workflows/approval-workflows.module';
import { ConflictValidationModule } from './conflict-validation/conflict-validation.module';
import { ChangeHistoryModule } from './change-history/change-history.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ApplicationsModule } from './applications/applications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ChatModule } from './chat/chat.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 1000, // 1000 requests per 15 minutes
      }
    ]),
    SharedModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    MailModule,
    OutagesModule,
    ApprovalWorkflowsModule,
    ConflictValidationModule,
    ChangeHistoryModule,
    NotificationsModule,
    ApplicationsModule,
    DashboardModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {} 