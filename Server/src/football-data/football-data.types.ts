export const FOOTBALL_DATA_QUEUE = 'football-data';

// Cache configuration: stale triggers background refresh, ttl evicts from cache
// TTL should be > stale so we can serve stale data while refreshing
export const CACHE_CONFIG = {
  COMPETITION: { stale: 12 * 60 * 60 * 1000, ttl: 24 * 60 * 60 * 1000 }, // 12h / 24h
  COMPETITIONS_LIST: { stale: 12 * 60 * 60 * 1000, ttl: 24 * 60 * 60 * 1000 },
  COMPETITION_MATCHES: { stale: 2.5 * 60 * 1000, ttl: 5 * 60 * 1000 }, // 2.5min / 5min
  MATCHES: { stale: 60 * 1000, ttl: 2 * 60 * 1000 }, // 1min / 2min
  STANDINGS: { stale: 15 * 60 * 1000, ttl: 30 * 60 * 1000 }, // 15min / 30min
  TEAM: { stale: 12 * 60 * 60 * 1000, ttl: 24 * 60 * 60 * 1000 },
  TEAM_MATCHES: { stale: 5 * 60 * 1000, ttl: 10 * 60 * 1000 }, // 5min / 10min
} as const;

export enum FootballJobType {
  COMPETITION = 'competition',
  COMPETITION_MATCHES = 'competition-matches',
  COMPETITION_STANDINGS = 'competition-standings',
  MATCHES = 'matches',
  TEAM = 'team',
  TEAM_MATCHES = 'team-matches',
  AVAILABLE_COMPETITIONS = 'available-competitions',
}

export interface FootballJobData {
  type: FootballJobType;
  competitionId?: number;
  teamId?: number;
  date?: string;
}

export function getJobId(data: FootballJobData): string {
  switch (data.type) {
    case FootballJobType.COMPETITION:
      return `competition_${data.competitionId}`;
    case FootballJobType.COMPETITION_MATCHES:
      return `competition_matches_${data.competitionId}`;
    case FootballJobType.COMPETITION_STANDINGS:
      return `standings_${data.competitionId}`;
    case FootballJobType.MATCHES:
      return data.date ? `matches_${data.date}` : 'matches_all';
    case FootballJobType.TEAM:
      return `team_${data.teamId}`;
    case FootballJobType.TEAM_MATCHES:
      return `team_matches_${data.teamId}`;
    case FootballJobType.AVAILABLE_COMPETITIONS:
      return 'available_competitions';
  }
}

export function getCacheKey(data: FootballJobData): string {
  return getJobId(data);
}

export function getPathAndTtl(data: FootballJobData): { path: string; ttl: number } {
  switch (data.type) {
    case FootballJobType.COMPETITION:
      return {
        path: `/competitions/${data.competitionId}`,
        ttl: CACHE_CONFIG.COMPETITION.ttl,
      };
    case FootballJobType.COMPETITION_MATCHES:
      return {
        path: `/competitions/${data.competitionId}/matches`,
        ttl: CACHE_CONFIG.COMPETITION_MATCHES.ttl,
      };
    case FootballJobType.COMPETITION_STANDINGS:
      return {
        path: `/competitions/${data.competitionId}/standings`,
        ttl: CACHE_CONFIG.STANDINGS.ttl,
      };
    case FootballJobType.MATCHES:
      if (data.date) {
        const nextDay = new Date(data.date + 'T00:00:00Z');
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        return {
          path: `/matches?dateFrom=${data.date}&dateTo=${nextDayStr}`,
          ttl: CACHE_CONFIG.MATCHES.ttl,
        };
      }
      return { path: '/matches', ttl: CACHE_CONFIG.MATCHES.ttl };
    case FootballJobType.TEAM:
      return {
        path: `/teams/${data.teamId}`,
        ttl: CACHE_CONFIG.TEAM.ttl,
      };
    case FootballJobType.TEAM_MATCHES:
      return {
        path: `/teams/${data.teamId}/matches`,
        ttl: CACHE_CONFIG.TEAM_MATCHES.ttl,
      };
    case FootballJobType.AVAILABLE_COMPETITIONS:
      return {
        path: '/competitions',
        ttl: CACHE_CONFIG.COMPETITIONS_LIST.ttl,
      };
  }
}

export function extractResponseData(type: FootballJobType, responseData: any): any {
  switch (type) {
    case FootballJobType.COMPETITION_MATCHES:
    case FootballJobType.TEAM_MATCHES:
    case FootballJobType.MATCHES:
      return responseData.matches;
    case FootballJobType.AVAILABLE_COMPETITIONS:
      return responseData.competitions;
    default:
      return responseData;
  }
}
