import type { TeamMinimal } from './team.types';
import type { Competition, Area, Season } from './competition.types';

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
  | 'HALF_TIME'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'SUSPENDED';

export type MatchStage =
  | 'REGULAR_SEASON'
  | 'GROUP_STAGE'
  | 'LEAGUE_STAGE'
  | 'ROUND_1'
  | 'ROUND_2'
  | 'ROUND_3'
  | 'PLAYOFFS'
  | 'LAST_64'
  | 'LAST_32'
  | 'LAST_16'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Referee {
  id: number;
  name: string;
  type: string;
  nationality?: string;
}

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
  area?: Area;
  season?: Season;
  venue?: string;
  referees?: Referee[];
  lastUpdated?: string;
}

export interface H2HTeamAggregates {
  id: number;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

export interface H2HAggregates {
  numberOfMatches: number;
  totalGoals: number;
  homeTeam: H2HTeamAggregates;
  awayTeam: H2HTeamAggregates;
}

export interface H2HResultSet {
  count: number;
  competitions?: string;
  first?: string;
  last?: string;
}

export interface Head2Head {
  aggregates: H2HAggregates;
  matches: Match[];
  resultSet?: H2HResultSet;
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
