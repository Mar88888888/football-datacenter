import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Competition } from '../competitions/competition';
import { MatchesResponse } from '../matches/dto/matches.response.interface';
import { Match } from '../matches/dto/match';
import { Team } from '../team/team';
import { Standings } from '../standings/standings';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const TTL = {
  COMPETITION: 86400,
  COMPETITIONS_LIST: 86400,
  COMPETITION_MATCHES: 300,
  MATCHES: 120,
  STANDINGS: 1800,
  TEAM: 86400,
  TEAM_MATCHES: 600,
};

class RateLimiter {
  private readonly logger = new Logger('RateLimiter');
  private blockedUntil = 0;

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async acquire(): Promise<void> {
    // If blocked by a 429 response, wait until unblocked
    const now = Date.now();
    if (this.blockedUntil > now) {
      const waitTime = this.blockedUntil - now;
      this.logger.warn(`API blocked. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await this.sleep(waitTime);
    }
  }

  // Call this when a 429 response is received
  setBlocked(waitSeconds: number): void {
    this.blockedUntil = Date.now() + waitSeconds * 1000 + 1000; // Add 1s buffer
    this.logger.warn(`Rate limited by API. Blocked for ${waitSeconds + 1}s`);
  }
}

@Injectable()
export class FootballDataClient {
  private readonly logger = new Logger(FootballDataClient.name);
  private readonly rateLimiter = new RateLimiter();

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async fetchData<T>(path: string, retryCount = 0): Promise<T> {
    const maxRetries = 3;

    await this.rateLimiter.acquire();

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(path).pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          this.logger.warn(`Resource not found at path: ${path}`);
          throw new NotFoundException(`Resource not found at path: ${path}`);
        }

        if (error.response?.status === 429) {
          const responseData = error.response?.data as {
            message?: string;
            errorCode?: number;
          };

          // Parse wait time from message like "You reached your request limit. Wait 43 seconds."
          const waitMatch = responseData?.message?.match(/Wait (\d+) seconds/);
          const waitSeconds = waitMatch ? parseInt(waitMatch[1], 10) : 60;

          this.logger.warn(
            `Rate limited (429) on ${path}. Wait ${waitSeconds}s. Retry ${retryCount + 1}/${maxRetries}`,
          );

          // Block the rate limiter
          this.rateLimiter.setBlocked(waitSeconds);

          if (retryCount < maxRetries) {
            // Wait and retry
            await this.sleep(waitSeconds * 1000 + 1000);
            return this.fetchData<T>(path, retryCount + 1);
          }

          this.logger.error(`Max retries reached for ${path}`);
          throw new HttpException(
            'API rate limit exceeded. Please try again later.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        this.logger.error(
          `Error fetching data from the path: ${path}`,
          error.stack,
          error.response?.data,
        );
      }

      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatDateToLocalYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getCompetitionById(competitionId: number): Promise<Competition> {
    const cacheKey = `competition_${competitionId}`;
    const cached = await this.cacheManager.get<Competition>(cacheKey);

    if (cached) {
      this.logger.debug(`CACHE HIT: ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`API CALL: /competitions/${competitionId}`);
    const competition = await this.fetchData<Competition>(
      `/competitions/${competitionId}`,
    );

    await this.cacheManager.set(cacheKey, competition, TTL.COMPETITION);
    return competition;
  }

  async getCompetitionMatches(competitionId: number): Promise<Match[]> {
    const cacheKey = `competition_matches_${competitionId}`;
    const cached = await this.cacheManager.get<Match[]>(cacheKey);

    if (cached) {
      this.logger.debug(`CACHE HIT: ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`API CALL: /competitions/${competitionId}/matches`);
    const response = await this.fetchData<MatchesResponse>(
      `/competitions/${competitionId}/matches`,
    );

    await this.cacheManager.set(
      cacheKey,
      response.matches,
      TTL.COMPETITION_MATCHES,
    );
    return response.matches;
  }

  async getMatches(date?: Date): Promise<Match[]> {
    let url = `/matches`;
    let cacheKey = 'matches_all';

    if (date) {
      const formattedDate = this.formatDateToLocalYYYYMMDD(date);

      let nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      const formattedNextDate = this.formatDateToLocalYYYYMMDD(nextDay);

      const params = new URLSearchParams({
        dateFrom: formattedDate,
        dateTo: formattedNextDate,
      });
      url += `?${params.toString()}`;
      cacheKey = `matches_${formattedDate}`;
    }

    const cached = await this.cacheManager.get<Match[]>(cacheKey);

    if (cached) {
      this.logger.debug(`CACHE HIT: ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`API CALL: ${url}`);
    const response = await this.fetchData<MatchesResponse>(url);

    await this.cacheManager.set(cacheKey, response.matches, TTL.MATCHES);
    return response.matches;
  }

  async getCompetitionStandings(competitionId: number): Promise<Standings> {
    const cacheKey = `standings_${competitionId}`;
    const cached = await this.cacheManager.get<Standings>(cacheKey);

    if (cached) {
      this.logger.debug(`CACHE HIT: ${cacheKey}`);
      return cached;
    }

    try {
      this.logger.debug(`API CALL: /competitions/${competitionId}/standings`);
      const standings = await this.fetchData<Standings>(
        `/competitions/${competitionId}/standings`,
      );

      await this.cacheManager.set(cacheKey, standings, TTL.STANDINGS);
      return standings;
    } catch (error) {
      this.logger.error(
        `Failed to fetch standings for ${competitionId}`,
        error,
      );
      throw new HttpException(
        'Failed to fetch standings',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTeamById(teamId: number): Promise<Team> {
    const cacheKey = `team_${teamId}`;
    const cached = await this.cacheManager.get<Team>(cacheKey);

    if (cached) {
      this.logger.debug(`CACHE HIT: ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`API CALL: /teams/${teamId}`);
    const team = await this.fetchData<Team>(`/teams/${teamId}`);

    await this.cacheManager.set(cacheKey, team, TTL.TEAM);
    return team;
  }

  async getTeamMatches(teamId: number): Promise<Match[]> {
    const cacheKey = `team_matches_${teamId}`;
    const cached = await this.cacheManager.get<Match[]>(cacheKey);

    if (cached) {
      this.logger.debug(`CACHE HIT: ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`API CALL: /teams/${teamId}/matches`);
    const response = await this.fetchData<MatchesResponse>(
      `/teams/${teamId}/matches`,
    );

    await this.cacheManager.set(cacheKey, response.matches, TTL.TEAM_MATCHES);
    return response.matches;
  }

  async getAvailableCompetitions(): Promise<Competition[]> {
    const cacheKey = 'available_competitions';
    const cached = await this.cacheManager.get<Competition[]>(cacheKey);

    if (cached) {
      this.logger.debug(`CACHE HIT: ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`API CALL: /competitions`);
    const response = await this.fetchData<{ competitions: Competition[] }>(
      '/competitions',
    );

    await this.cacheManager.set(
      cacheKey,
      response.competitions,
      TTL.COMPETITIONS_LIST,
    );
    return response.competitions;
  }
}
