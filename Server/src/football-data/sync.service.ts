import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  FOOTBALL_DATA_QUEUE,
  FootballJobType,
  FootballJobData,
  getJobId,
} from './football-data.types';

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

  constructor(
    @InjectQueue(FOOTBALL_DATA_QUEUE) private readonly queue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncTodayMatches(): Promise<void> {
    this.logger.log('Queueing sync: today matches');

    const today = new Date();
    const dateStr = this.formatDate(today);

    await this.addJob({
      type: FootballJobType.MATCHES,
      date: dateStr,
    });

    this.logger.log('Queued sync: today matches');
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncStandings(): Promise<void> {
    this.logger.log('Queueing sync: standings for popular competitions');

    for (const competitionId of POPULAR_COMPETITIONS) {
      await this.addJob({
        type: FootballJobType.COMPETITION_STANDINGS,
        competitionId,
      });
    }

    this.logger.log(`Queued ${POPULAR_COMPETITIONS.length} standings jobs`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncCompetitions(): Promise<void> {
    this.logger.log('Queueing sync: competition info');

    for (const competitionId of POPULAR_COMPETITIONS) {
      await this.addJob({
        type: FootballJobType.COMPETITION,
        competitionId,
      });
    }

    this.logger.log(`Queued ${POPULAR_COMPETITIONS.length} competition jobs`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncAvailableCompetitions(): Promise<void> {
    this.logger.log('Queueing sync: available competitions list');

    await this.addJob({
      type: FootballJobType.AVAILABLE_COMPETITIONS,
    });

    this.logger.log('Queued available competitions job');
  }

  private async addJob(data: FootballJobData): Promise<void> {
    const jobId = getJobId(data);

    // Check if job already exists to avoid duplicates
    const existingJob = await this.queue.getJob(jobId);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'waiting' || state === 'active' || state === 'delayed') {
        this.logger.debug(`Job ${jobId} already queued (${state}), skipping`);
        return;
      }
    }

    await this.queue.add(data.type, data, { jobId });
    this.logger.debug(`Added job: ${jobId}`);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
