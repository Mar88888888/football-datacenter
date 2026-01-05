import { Team } from '../team/team';

export class StandingsEntry {
  stage: string;
  type: string;
  group: string | null;
  table: TablePosition[];
}

export class TablePosition {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export class Standings {
  competition: {
    id: number;
    name: string;
    type: string;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
  standings: StandingsEntry[];
}
