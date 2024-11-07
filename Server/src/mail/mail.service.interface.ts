import { User } from '../users/user.entity';

export interface IMailService {
  sendVerificationEmail(to: string, token: string, user: User): Promise<void>;
  sendMatchdayNotification(to: string, user: User, matchesToday: any[]): Promise<void>;
}
