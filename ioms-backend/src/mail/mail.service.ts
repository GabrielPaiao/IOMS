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
    token: string,
    role: string,
  ): Promise<boolean> {
    const appUrl = this.configService.get('APP_URL');
    const invitationLink = `${appUrl}/auth/register?token=${token}`;

    console.log('🚀 Enviando convite para:', email);
    console.log('🔗 Link de convite:', invitationLink);

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Convite para o IOMS',
        template: './invitation',
        context: {
          email,
          role,
          invitationLink,
          appUrl,
          supportEmail: this.configService.get('MAIL_SUPPORT'),
        },
      });
      console.log('✅ Email enviado com sucesso para:', email);
      return true;
    } catch (error) {
      console.error('❌ Error sending invitation email:', error);
      throw error; // Lança o erro para que seja capturado pelo controller
    }
  }
}