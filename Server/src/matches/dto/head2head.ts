import { Match } from './match';

export interface TeamAggregates {
  id: number;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

export interface Aggregates {
  numberOfMatches: number;
  totalGoals: number;
  homeTeam: TeamAggregates;
  awayTeam: TeamAggregates;
}

export interface ResultSet {
  count: number;
  competitions: string;
  first: string;
  last: string;
}

export interface Head2Head {
  aggregates: Aggregates;
  matches: Match[];
  resultSet?: ResultSet;
}
