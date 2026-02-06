import { Area, Competition, Season } from '../../competitions/competition';
import { Team } from '../../team/team';
import { Score } from './score';

export interface Referee {
  id: number;
  name: string;
  type: string;
  nationality?: string;
}

export class Match {
  id: number;
  score: Score;
  homeTeam: Team;
  awayTeam: Team;
  competition: Competition;
  utcDate: Date;
  status: string;
  matchday?: number;
  stage?: string;
  group?: string;
  area?: Area;
  season?: Season;
  venue?: string;
  referees?: Referee[];
  lastUpdated?: string;
}
