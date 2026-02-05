import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  FootballJobData,
  FootballJobType,
  getCacheKey,
  getPathAndTtl,
  extractResponseData,
  CACHE_CONFIG,
} from './football-data.types';
import { FetcherService } from './fetcher.service';
import { Competition } from '../competitions/competition';
import { Match } from '../matches/dto/match';
import { Team } from '../team/team';
import { Standings } from '../standings/standings';
import { DataStatus, DataStatusType } from '../common/constants';

export interface DataResult<T> {
  data: T | null;
  status: DataStatusType;
  isRefreshing?: boolean;
  retryAfter?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable()
export class FootballDataService {
  private readonly logger = new Logger(FootballDataService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
    private readonly fetcher: FetcherService,
  ) {}

  async getCompetition(competitionId: number): Promise<DataResult<Competition>> {
    return this.getData<Competition>(
      { type: FootballJobType.COMPETITION, competitionId },
      CACHE_CONFIG.COMPETITION.stale,
    );
  }

  async getCompetitionMatches(competitionId: number): Promise<DataResult<Match[]>> {
    return this.getData<Match[]>(
      { type: FootballJobType.COMPETITION_MATCHES, competitionId },
      CACHE_CONFIG.COMPETITION_MATCHES.stale,
    );
  }

  async getCompetitionStandings(competitionId: number): Promise<DataResult<Standings>> {
    return this.getData<Standings>(
      { type: FootballJobType.COMPETITION_STANDINGS, competitionId },
      CACHE_CONFIG.STANDINGS.stale,
    );
  }

  async getMatches(date?: Date): Promise<DataResult<Match[]>> {
    const dateStr = date ? this.formatDate(date) : undefined;
    return this.getData<Match[]>(
      { type: FootballJobType.MATCHES, date: dateStr },
      CACHE_CONFIG.MATCHES.stale,
    );
  }

  async getTeam(teamId: number): Promise<DataResult<Team>> {
    return this.getData<Team>(
      { type: FootballJobType.TEAM, teamId },
      CACHE_CONFIG.TEAM.stale,
    );
  }

  async getTeamMatches(teamId: number): Promise<DataResult<Match[]>> {
    return this.getData<Match[]>(
      { type: FootballJobType.TEAM_MATCHES, teamId },
      CACHE_CONFIG.TEAM_MATCHES.stale,
    );
  }

  async getAvailableCompetitions(): Promise<DataResult<Competition[]>> {
    return this.getData<Competition[]>(
      { type: FootballJobType.AVAILABLE_COMPETITIONS },
      CACHE_CONFIG.COMPETITIONS_LIST.stale,
    );
  }

  async fetchAndCache(jobData: FootballJobData): Promise<void> {
    const cacheKey = getCacheKey(jobData);
    await this.fetcher.fetch(cacheKey, () => this.doFetchAndCache(jobData));
  }

  private async getData<T>(
    jobData: FootballJobData,
    staleThreshold: number,
  ): Promise<DataResult<T>> {
    const cacheKey = getCacheKey(jobData);
    const cached = await this.cacheManager.get<CacheEntry<T>>(cacheKey);

    if (cached) {
      const age = Date.now() - cached.timestamp;
      const isStale = age > staleThreshold;

      if (isStale) {
        this.triggerBackgroundRefresh(jobData);
        return { data: cached.data, status: DataStatus.STALE, isRefreshing: true };
      }

      return { data: cached.data, status: DataStatus.FRESH };
    }

    return this.fetchInline<T>(jobData);
  }

  private async fetchInline<T>(jobData: FootballJobData): Promise<DataResult<T>> {
    const cacheKey = getCacheKey(jobData);

    try {
      const result = await this.fetcher.fetch<T>(cacheKey, () =>
        this.doFetchAndCache<T>(jobData),
      );
      return { data: result, status: DataStatus.FRESH };
    } catch (error) {
      this.logger.error(`Fetch failed for ${cacheKey}: ${error.message}`);
      return { data: null, status: DataStatus.PROCESSING, retryAfter: 30 };
    }
  }

  private async doFetchAndCache<T>(jobData: FootballJobData): Promise<T> {
    const { path, ttl } = getPathAndTtl(jobData);
    const cacheKey = getCacheKey(jobData);

    const response = await firstValueFrom(this.httpService.get(path));
    const result = extractResponseData(jobData.type, response.data);

    const cacheEntry: CacheEntry<T> = {
      data: result,
      timestamp: Date.now(),
    };
    await this.cacheManager.set(cacheKey, cacheEntry, ttl);

    return result;
  }


  private triggerBackgroundRefresh(jobData: FootballJobData): void {
    const cacheKey = getCacheKey(jobData);

    if (this.fetcher.isInFlight(cacheKey)) {
      return;
    }

    this.fetcher
      .fetch(cacheKey, () => this.doFetchAndCache(jobData))
      .catch((error) => {
        this.logger.error(`Background refresh failed for ${cacheKey}: ${error.message}`);
      });
  }

  private formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
