import { Team } from '../team/team';

export class Player {
  constructor(
    private id: number,
    private name: string,
    private position: string,
    private shirtNumber: number,
    private CurrentTeam: Team,
  ){}

  getName(): string{
    return this.name;
  }
  getPosition(): string{
    return this.position;
  }
  getShirtNumber(): number{
    return this.shirtNumber;
  }
  getCurrentTeam(): Team{
    return this.CurrentTeam;
  }
  getId(): number{
    return this.id;
  }
}
