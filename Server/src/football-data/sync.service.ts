import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FootballJobType } from './football-data.types';
import { FootballDataService } from './football-data.service';

const POPULAR_COMPETITIONS = [
  2021, // Premier League
  2014, // La Liga
  2002, // Bundesliga
  2019, // Serie A
  2015, // Ligue 1
  2001, // Champions League
];

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly dataService: FootballDataService) {}

  @Cron('*/15 * * * *')
  async syncTodayMatches(): Promise<void> {
    this.logger.log('Sync: today matches');

    const today = new Date();
    const dateStr = this.formatDate(today);

    try {
      await this.dataService.fetchAndCache({
        type: FootballJobType.MATCHES,
        date: dateStr,
      });
      this.logger.log('Synced: today matches');
    } catch (error) {
      this.logger.error(`Failed to sync today matches: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncStandings(): Promise<void> {
    this.logger.log('Sync: standings for popular competitions');

    for (const competitionId of POPULAR_COMPETITIONS) {
      try {
        await this.dataService.fetchAndCache({
          type: FootballJobType.COMPETITION_STANDINGS,
          competitionId,
        });
      } catch (error) {
        this.logger.error(`Failed to sync standings for ${competitionId}: ${error.message}`);
      }
    }

    this.logger.log('Synced: standings');
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncCompetitions(): Promise<void> {
    this.logger.log('Sync: competition info');

    for (const competitionId of POPULAR_COMPETITIONS) {
      try {
        await this.dataService.fetchAndCache({
          type: FootballJobType.COMPETITION,
          competitionId,
        });
      } catch (error) {
        this.logger.error(`Failed to sync competition ${competitionId}: ${error.message}`);
      }
    }

    this.logger.log('Synced: competitions');
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncAvailableCompetitions(): Promise<void> {
    this.logger.log('Sync: available competitions list');

    try {
      await this.dataService.fetchAndCache({
        type: FootballJobType.AVAILABLE_COMPETITIONS,
      });
      this.logger.log('Synced: available competitions');
    } catch (error) {
      this.logger.error(`Failed to sync available competitions: ${error.message}`);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
