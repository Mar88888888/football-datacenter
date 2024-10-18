import { Competition } from '../competition/competition';
import { Team } from '../team/team';

export class Match {
  constructor(
    private id: number,
    private homeScore: number,
    private awayScore: number,
    private homeTeam: Team,
    private awayTeam: Team,
    private competition: Competition,
    private startDate: Date,
  ){}
  
  getId(): number{
    return this.id;
  }
  
  getHomeScore(): number{
    return this.homeScore;
  }

  getAwayScore(): number{
    return this.awayScore;
  }

  getHomeTeam(): Team{
    return this.homeTeam;
  }

  getAwayTeam(): Team{
    return this.awayTeam;
  }

  getCompetition(): Competition{
    return this.competition;
  }

  getStartDate(): Date{
    return this.startDate;
  }

}
