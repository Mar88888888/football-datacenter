import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FootballDataClient } from './football-data.client';

// Popular competition IDs from football-data.org
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
  private isSyncing = false;

  constructor(private readonly footballDataClient: FootballDataClient) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncTodayMatches(): Promise<void> {
    if (this.isSyncing) {
      this.logger.warn('Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Starting sync: today matches');

    try {
      await this.footballDataClient.getMatches(new Date());
      this.logger.log('Sync completed: today matches');
    } catch (error) {
      this.logger.error('Sync failed: today matches', error.message);
    } finally {
      this.isSyncing = false;
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncStandings(): Promise<void> {
    this.logger.log('Starting sync: standings for popular competitions');

    for (const competitionId of POPULAR_COMPETITIONS) {
      try {
        await this.footballDataClient.getCompetitionStandings(competitionId);
        this.logger.log(`Synced standings for competition ${competitionId}`);

        // Small delay between requests to respect rate limits
        await this.delay(6500); // ~9 requests per minute to stay safe
      } catch (error) {
        this.logger.error(
          `Failed to sync standings for competition ${competitionId}`,
          error.message,
        );
      }
    }

    this.logger.log('Sync completed: standings');
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncCompetitions(): Promise<void> {
    this.logger.log('Starting sync: competition info');

    for (const competitionId of POPULAR_COMPETITIONS) {
      try {
        await this.footballDataClient.getCompetitionById(competitionId);
        this.logger.log(`Synced competition info ${competitionId}`);

        await this.delay(6500);
      } catch (error) {
        this.logger.error(
          `Failed to sync competition ${competitionId}`,
          error.message,
        );
      }
    }

    this.logger.log('Sync completed: competitions');
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncAvailableCompetitions(): Promise<void> {
    this.logger.log('Starting sync: available competitions list');

    try {
      await this.footballDataClient.getAvailableCompetitions();
      this.logger.log('Synced available competitions list');
    } catch (error) {
      this.logger.error(
        'Failed to sync available competitions list',
        error.message,
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
