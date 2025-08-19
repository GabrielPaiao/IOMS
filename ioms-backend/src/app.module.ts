import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
  providers: [AppService],
})
export class AppModule {} 