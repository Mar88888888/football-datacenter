export class Player {
  private id: number;
  private name: string;
  private position: string;
  private shirtNumber: number;
  private photo: string;
  private currentTeamId: number;

  constructor(
    data: {
      id: number, 
      name: string, 
      position: string,
      shirtNumber: number;
      photo: string;
      currentTeamId: number;
    }){
    Object.assign(this, data);
  }

  getName(): string{
    return this.name;
  }
  getPosition(): string{
    return this.position;
  }
  getShirtNumber(): number{
    return this.shirtNumber;
  }
  getCurrentTeam(): number{
    return this.currentTeamId;
  }
  getId(): number{
    return this.id;
  }

  getPhoto(): string{
    return this.photo;
  }
}
