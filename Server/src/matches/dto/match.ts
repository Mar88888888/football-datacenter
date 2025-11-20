import { Competition } from '../../competitions/competition';
import { Team } from '../../team/team';
import { Score } from './score';

export class Match {
  constructor(
    public id: number,
    public score: Score,
    public homeTeam: Team,
    public awayTeam: Team,
    public competition: Competition,
    public utcDate: Date,
  ) {}
}
