import { Competition } from '../../competitions/competition';
import { Team } from '../../team/team';
import { Score } from './score';

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
}
