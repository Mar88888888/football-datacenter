import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job, DelayedError } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  FOOTBALL_DATA_QUEUE,
  FootballJobData,
  getCacheKey,
  getPathAndTtl,
  extractResponseData,
} from './football-data.types';

@Processor(FOOTBALL_DATA_QUEUE, {
  limiter: {
    max: 10,
    duration: 60000, // 10 jobs per minute
  },
  concurrency: 1,
})
export class FootballDataProcessor extends WorkerHost {
  private readonly logger = new Logger(FootballDataProcessor.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super();
  }

  async process(job: Job<FootballJobData>): Promise<void> {
    const { data } = job;
    this.logger.log(`Processing job ${job.id}: ${data.type}`);

    try {
      const result = await this.fetchAndCache(data);
      this.logger.log(`Job ${job.id} completed successfully`);
      return result;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 429) {
        const waitMatch = (error.response?.data as any)?.message?.match(/Wait (\d+) seconds/);
        const waitSeconds = waitMatch ? parseInt(waitMatch[1], 10) : 60;

        this.logger.debug(`Rate limited, delaying job ${job.id} by ${waitSeconds}s`);
        await job.moveToDelayed(Date.now() + waitSeconds * 1000, job.token);
        throw new DelayedError();
      }

      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  private async fetchAndCache(data: FootballJobData): Promise<void> {
    const { path, ttl } = getPathAndTtl(data);
    const cacheKey = getCacheKey(data);

    this.logger.debug(`API CALL: ${path}`);

    const response = await firstValueFrom(this.httpService.get(path));
    const result = extractResponseData(data.type, response.data);

    const cacheEntry = {
      data: result,
      timestamp: Date.now(),
    };

    await this.cacheManager.set(cacheKey, cacheEntry, ttl);
    this.logger.debug(`Cached: ${cacheKey} (TTL: ${ttl / 1000}s)`);
  }
}
