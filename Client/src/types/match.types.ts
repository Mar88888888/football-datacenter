import type { TeamMinimal } from './team.types';
import type { Competition } from './competition.types';

export interface Score {
  winner?: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  duration?: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime?: {
    home: number | null;
    away: number | null;
  };
}

export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED';

export type MatchStage =
  | 'REGULAR_SEASON'
  | 'GROUP_STAGE'
  | 'LEAGUE_STAGE'
  | 'ROUND_1'
  | 'ROUND_2'
  | 'ROUND_3'
  | 'LAST_64'
  | 'LAST_32'
  | 'LAST_16'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday?: number;
  stage?: MatchStage | string;
  group?: string;
  score: Score;
  homeTeam: TeamMinimal;
  awayTeam: TeamMinimal;
  competition?: Competition;
}

export interface MatchesResponse {
  filters: MatchFilters;
  matches: Match[];
}

export interface MatchFilters {
  competitions?: string[];
  limit?: number;
  season?: number;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  ids?: number[];
  offset?: number;
}
