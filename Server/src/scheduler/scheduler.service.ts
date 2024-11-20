import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IUsersService } from '../users/users.service.interface';
import { IMailService } from '../mail/mail.service.interface';
import { IMatchesService } from '../matches/matches.service.interface';

@Injectable()
export class SchedulerService {
  constructor(
    @Inject('IUsersService') private readonly usersService: IUsersService,
    @Inject('IMailService') private readonly mailService: IMailService,
    @Inject('IMatchesService') private readonly matchesService: IMatchesService,
  ) {}


  @Cron('11 12 * * *')
  async handleMatchdayCron() {
    const today = new Date();
    const tillDay = this.getDateAfterDays(today, 7);

    const users = await this.usersService.findAll();
    for (const user of users) {
      let matchesToday = [];
      const {favMatches: matches} = await this.matchesService.getUserMatches(user.id);
      for (const match of matches) {
        matchesToday.push({ type: 'competition', competition: match.tournament, matchDate: new Date(match.startTimestamp *1000) });
      }

      console.log(matchesToday);
      if (matchesToday.length > 0) {
        await this.mailService.sendMatchdayNotification(user.email, user, matchesToday);
      }
    }
  }

  private isMatchToday(today: Date, match: Date): boolean {
    return (
      today.getFullYear() === match.getFullYear() &&
      today.getMonth() === match.getMonth() &&
      today.getDate() === match.getDate()
    );
  }

  private getDateAfterDays(firstDate: Date, days: number): Date {
    const result = new Date(firstDate);
    result.setDate(result.getDate() + days);
    return result;
  }
}
