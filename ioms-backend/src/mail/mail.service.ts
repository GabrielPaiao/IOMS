import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendUserInvitation(
    email: string,
    firstName: string,
    token: string,
    role: string,
  ): Promise<boolean> {
    const appUrl = this.configService.get('APP_URL');
    const invitationLink = `${appUrl}/auth/register?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Convite para o IOMS',
        template: './invitation',
        context: {
          firstName,
          role,
          invitationLink,
          appUrl,
          supportEmail: this.configService.get('MAIL_SUPPORT'),
        },
      });
      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return false;
    }
  }
}