import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CompetitionService } from '../competition/competition.service';
import { TeamService } from '../team/teams.service';
import { CoachService } from '../coach/coach.service';
import { PlayerService } from '../player/player.service';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly competitionService: CompetitionService,
    private readonly teamService: TeamService,
    private readonly coachService: CoachService,
    private readonly playerService: PlayerService,
  ) {}

  @Cron('10 17 * * *')
  async handleCron() {
    await this.competitionService.fetchAndStoreCompetitions();
    await this.playerService.fetchAndStorePlayers();
    await this.teamService.fetchAndStoreTeams();
    await this.coachService.fetchAndStoreCoaches();
  }
}
