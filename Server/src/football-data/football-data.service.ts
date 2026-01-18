import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  FOOTBALL_DATA_QUEUE,
  FootballJobData,
  FootballJobType,
  getJobId,
  getCacheKey,
  getPathAndTtl,
  extractResponseData,
  CACHE_CONFIG,
} from './football-data.types';
import { Competition } from '../competitions/competition';
import { Match } from '../matches/dto/match';
import { Team } from '../team/team';
import { Standings } from '../standings/standings';

export interface DataResult<T> {
  data: T | null;
  status: 'fresh' | 'stale' | 'processing';
  isRefreshing?: boolean;
  retryAfter?: number; // seconds until client should retry
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable()
export class FootballDataService {
  private readonly logger = new Logger(FootballDataService.name);
  private readonly pendingFetches = new Map<string, Promise<any>>();

  constructor(
    @InjectQueue(FOOTBALL_DATA_QUEUE) private readonly queue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async getCompetition(
    competitionId: number,
  ): Promise<DataResult<Competition>> {
    return this.getData<Competition>(
      {
        type: FootballJobType.COMPETITION,
        competitionId,
      },
      CACHE_CONFIG.COMPETITION.stale,
    );
  }

  async getCompetitionMatches(
    competitionId: number,
  ): Promise<DataResult<Match[]>> {
    return this.getData<Match[]>(
      {
        type: FootballJobType.COMPETITION_MATCHES,
        competitionId,
      },
      CACHE_CONFIG.COMPETITION_MATCHES.stale,
    );
  }

  async getCompetitionStandings(
    competitionId: number,
  ): Promise<DataResult<Standings>> {
    return this.getData<Standings>(
      {
        type: FootballJobType.COMPETITION_STANDINGS,
        competitionId,
      },
      CACHE_CONFIG.STANDINGS.stale,
    );
  }

  async getMatches(date?: Date): Promise<DataResult<Match[]>> {
    const dateStr = date ? this.formatDate(date) : undefined;
    return this.getData<Match[]>(
      {
        type: FootballJobType.MATCHES,
        date: dateStr,
      },
      CACHE_CONFIG.MATCHES.stale,
    );
  }

  async getTeam(teamId: number): Promise<DataResult<Team>> {
    return this.getData<Team>(
      {
        type: FootballJobType.TEAM,
        teamId,
      },
      CACHE_CONFIG.TEAM.stale,
    );
  }

  async getTeamMatches(teamId: number): Promise<DataResult<Match[]>> {
    return this.getData<Match[]>(
      {
        type: FootballJobType.TEAM_MATCHES,
        teamId,
      },
      CACHE_CONFIG.TEAM_MATCHES.stale,
    );
  }

  async getAvailableCompetitions(): Promise<DataResult<Competition[]>> {
    return this.getData<Competition[]>(
      {
        type: FootballJobType.AVAILABLE_COMPETITIONS,
      },
      CACHE_CONFIG.COMPETITIONS_LIST.stale,
    );
  }

  private async getData<T>(
    jobData: FootballJobData,
    staleThreshold: number,
  ): Promise<DataResult<T>> {
    const cacheKey = getCacheKey(jobData);
    const cached = await this.cacheManager.get<CacheEntry<T>>(cacheKey);

    // Cache hit - check freshness
    if (cached) {
      const age = Date.now() - cached.timestamp;
      const isStale = age > staleThreshold;

      if (isStale) {
        // Stale-while-revalidate: return stale data but trigger background refresh
        this.logger.debug(
          `Stale data for ${cacheKey}, triggering background refresh`,
        );
        await this.queueJob(jobData);
        return { data: cached.data, status: 'stale', isRefreshing: true };
      }

      // Fresh data
      return { data: cached.data, status: 'fresh' };
    }

    // Cache miss - try sync fetch with deduplication
    return this.fetchWithDeduplication<T>(jobData);
  }

  private async fetchWithDeduplication<T>(
    jobData: FootballJobData,
  ): Promise<DataResult<T>> {
    const cacheKey = getCacheKey(jobData);

    // Check if fetch is already in progress
    const pendingFetch = this.pendingFetches.get(cacheKey);
    if (pendingFetch) {
      this.logger.debug(`Awaiting pending fetch for ${cacheKey}`);
      return pendingFetch;
    }

    // Create new fetch promise
    const fetchPromise = this.attemptSyncFetch<T>(jobData);
    this.pendingFetches.set(cacheKey, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      this.pendingFetches.delete(cacheKey);
    }
  }

  private async attemptSyncFetch<T>(
    jobData: FootballJobData,
  ): Promise<DataResult<T>> {
    const { path, ttl } = getPathAndTtl(jobData);
    const cacheKey = getCacheKey(jobData);

    try {
      this.logger.debug(`Sync fetch attempt: ${path}`);
      const response = await firstValueFrom(this.httpService.get(path));
      const result = extractResponseData(jobData.type, response.data);

      // Cache the result
      const cacheEntry = {
        data: result,
        timestamp: Date.now(),
      };
      await this.cacheManager.set(cacheKey, cacheEntry, ttl);
      this.logger.debug(`Sync fetch success: ${cacheKey}`);

      return { data: result as T, status: 'fresh' };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 429) {
        const retryAfter = this.extractRetryAfter(error);
        this.logger.debug(`Rate limited, queueing: ${cacheKey} (retry in ${retryAfter}s)`);
        await this.queueJob(jobData);
        return { data: null, status: 'processing', retryAfter };
      }

      this.logger.error(`Sync fetch failed, queueing: ${error.message}`);
      await this.queueJob(jobData);
      return { data: null, status: 'processing', retryAfter: 5 };
    }
  }

  private extractRetryAfter(error: AxiosError): number {
    // Try to get from response header
    const headerValue = error.response?.headers?.['retry-after'];
    if (headerValue) {
      const seconds = parseInt(headerValue, 10);
      if (!isNaN(seconds)) return seconds;
    }

    // Try to parse from API message (e.g., "Wait 47 seconds")
    const message = (error.response?.data as any)?.message;
    if (message) {
      const match = message.match(/Wait (\d+) seconds/i);
      if (match) return parseInt(match[1], 10);
    }

    // Default fallback
    return 60;
  }

  private async queueJob(jobData: FootballJobData): Promise<void> {
    const jobId = getJobId(jobData);

    // Check if job already exists (deduplication)
    const existingJob = await this.queue.getJob(jobId);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'waiting' || state === 'active' || state === 'delayed') {
        this.logger.debug(`Job ${jobId} already queued (${state})`);
        return;
      }
    }

    await this.queue.add(jobData.type, jobData, { jobId });
    this.logger.debug(`Queued job: ${jobId}`);
  }

  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
