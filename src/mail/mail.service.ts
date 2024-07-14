import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(to: string, token: string, user: User) {
    const templateName = './verification';
    console.log('Sending email using template:', templateName);

    const url = `http://localhost:3000/auth/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Email Verification',
      template: './verification', 
      context: { 
        name: user.name,
        verificationLink: url
      },
    });
  }
}
