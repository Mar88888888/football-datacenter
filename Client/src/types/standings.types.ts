import type { Competition, Season } from './competition.types';
import type { TeamMinimal } from './team.types';

export interface TableEntry {
  position: number;
  team: TeamMinimal;
  playedGames: number;
  form?: string;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface StandingGroup {
  stage: string;
  type: 'TOTAL' | 'HOME' | 'AWAY';
  group: string | null;
  table: TableEntry[];
}

export interface Standings {
  competition: Competition;
  season: Season;
  standings: StandingGroup[];
}
