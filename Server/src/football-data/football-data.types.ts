export const CACHE_CONFIG = {
  COMPETITION: { stale: 12 * 60 * 60 * 1000, ttl: 24 * 60 * 60 * 1000 }, // 12h / 24h
  COMPETITIONS_LIST: { stale: 12 * 60 * 60 * 1000, ttl: 24 * 60 * 60 * 1000 },
  COMPETITION_MATCHES: { stale: 15 * 60 * 1000, ttl: 30 * 60 * 1000 }, // 15min / 30min
  COMPETITION_SCORERS: { stale: 6 * 60 * 60 * 1000, ttl: 12 * 60 * 60 * 1000 }, // 6h / 12h
  MATCHES: { stale: 10 * 60 * 1000, ttl: 20 * 60 * 1000 }, // 10min / 20min
  MATCH: { stale: 5 * 60 * 1000, ttl: 15 * 60 * 1000 }, // 5min / 15min (single match)
  HEAD2HEAD: { stale: 6 * 60 * 60 * 1000, ttl: 12 * 60 * 60 * 1000 }, // 6h / 12h
  STANDINGS: { stale: 30 * 60 * 1000, ttl: 60 * 60 * 1000 }, // 30min / 1h
  TEAM: { stale: 12 * 60 * 60 * 1000, ttl: 24 * 60 * 60 * 1000 },
  TEAM_MATCHES: { stale: 15 * 60 * 1000, ttl: 30 * 60 * 1000 }, // 15min / 30min
} as const;

export enum FootballJobType {
  COMPETITION = 'competition',
  COMPETITION_MATCHES = 'competition-matches',
  COMPETITION_STANDINGS = 'competition-standings',
  COMPETITION_SCORERS = 'competition-scorers',
  MATCHES = 'matches',
  MATCH = 'match',
  HEAD2HEAD = 'head2head',
  TEAM = 'team',
  TEAM_MATCHES = 'team-matches',
  AVAILABLE_COMPETITIONS = 'available-competitions',
}

export interface FootballJobData {
  type: FootballJobType;
  competitionId?: number;
  teamId?: number;
  matchId?: number;
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
    case FootballJobType.COMPETITION_SCORERS:
      return `scorers_${data.competitionId}`;
    case FootballJobType.MATCHES:
      return data.date ? `matches_${data.date}` : 'matches_all';
    case FootballJobType.MATCH:
      return `match_${data.matchId}`;
    case FootballJobType.HEAD2HEAD:
      return `head2head_${data.matchId}`;
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

export function getPathAndTtl(data: FootballJobData): {
  path: string;
  ttl: number;
} {
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
    case FootballJobType.COMPETITION_SCORERS:
      return {
        path: `/competitions/${data.competitionId}/scorers`,
        ttl: CACHE_CONFIG.COMPETITION_SCORERS.ttl,
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
    case FootballJobType.MATCH:
      return {
        path: `/matches/${data.matchId}`,
        ttl: CACHE_CONFIG.MATCH.ttl,
      };
    case FootballJobType.HEAD2HEAD:
      return {
        path: `/matches/${data.matchId}/head2head`,
        ttl: CACHE_CONFIG.HEAD2HEAD.ttl,
      };
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

export function extractResponseData(
  type: FootballJobType,
  responseData: any,
): any {
  switch (type) {
    case FootballJobType.COMPETITION_MATCHES:
    case FootballJobType.TEAM_MATCHES:
    case FootballJobType.MATCHES:
      return responseData.matches;
    case FootballJobType.AVAILABLE_COMPETITIONS:
      return responseData.competitions;
    case FootballJobType.COMPETITION_SCORERS:
      return responseData.scorers;
    // MATCH and HEAD2HEAD return the full response object
    default:
      return responseData;
  }
}
