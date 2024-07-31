import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CompetitionService } from '../competition/competition.service';
import { TeamService } from '../team/teams.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly competitionService: CompetitionService,
    private readonly teamService: TeamService,
    private readonly usersService: UsersService,
    private readonly competitionsService: CompetitionService,
    private readonly mailService: MailService,
  ) {}

  @Cron('17 11 * * *')
  async handleCron() {
    await this.competitionService.fetchAndStoreCompetitions();
    await this.teamService.fetchAndStoreTeams();
  }

  @Cron('00 01 * * *')
  async handleMatchdayCron() {
    const today = new Date();
    const tillDay = this.getDateAfterDays(today, 7);

    const users = await this.usersService.findAll();
    for (const user of users) {
      const favCompetitions = user.favCompetitions;
      const favTeams = user.favTeams;

      let matchesToday = [];

      for (const competition of favCompetitions) {
        const matches = await this.competitionsService.getMatches(competition.id, today, tillDay);
        for (const match of matches) {
          const matchDate = new Date(match.utcDate);
          if (this.isMatchToday(today, matchDate)) {
            matchesToday.push({ type: 'competition', competition, matchDate });
          }
        }
      }

      for (const team of favTeams) {
        const matches = await this.teamService.getMatches(team.id, today, tillDay);
        for (const match of matches) {
          const matchDate = new Date(match.utcDate);
          if (this.isMatchToday(today, matchDate)) {
            matchesToday.push({ type: 'team', team, matchDate });
          }
        }
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
