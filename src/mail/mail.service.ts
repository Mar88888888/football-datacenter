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
      to,
      subject: 'Email Verification',
      template: templateName, 
      context: { 
        name: user.name,
        verificationLink: url
      },
    });
  }

  async sendMatchdayNotification(to: string, user: User, matchesToday: any[]) {
    const templateName = './matchdayNotification';

    console.log('Sending email using template:', templateName, ' to ', to);

    const competitions = matchesToday.filter(match => match.type === 'competition');
    const teams = matchesToday.filter(match => match.type === 'team');

    await this.mailerService.sendMail({
      to,
      subject: 'MatchDay!',
      template: templateName,
      context: {
        name: user.name,
        competitions,
        teams,
      },
    });

    console.log('Email sent');
  }

}
