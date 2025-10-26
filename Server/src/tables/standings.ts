import { Team } from '../team/team';

export class Standings {
  stage: string;
  type: string;
  group: string | null;
  table: TablePosition[];
}

export class TablePosition {
  position: number;
  team: Team;
  playedGames: 9;
  won: 8;
  draw: 0;
  lost: 1;
  points: 24;
  goalsFor: 20;
  goalsAgainst: 9;
  goalDifference: 11;
}
