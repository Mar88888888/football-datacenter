import { Competition } from '../competition/competition';
import { User } from '../users/user.entity';

export class Team {
  private id: number;
  private name: string;
  private shortName: string;
  private crest: string;
  private address: string;
  private gender: 'male' | 'female';
  private founded: string;
  private clubColors: string;
  private coachName: string;
  private competitions: Competition[];
  private users: User[];

  setId(id: number): Team {
    this.id = id;
    return this;
  }

  getId(): number {
    return this.id;
  }

  setName(name: string): Team {
    this.name = name;
    return this;
  }

  getName(): string {
    return this.name;
  }

  setShortName(shortName: string): Team {
    this.shortName = shortName;
    return this;
  }

  getShortName(): string {
    return this.shortName;
  }

  setCrest(crest: string): Team {
    this.crest = crest;
    return this;
  }

  getCrest(): string {
    return this.crest;
  }

  setAddress(address: string): Team {
    this.address = address;
    return this;
  }

  getAddress(): string {
    return this.address;
  }

  setGender(gender: 'male' | 'female'): Team {
    this.gender = gender;
    return this;
  }

  getGender(): 'male' | 'female' {
    return this.gender;
  }

  setFounded(founded: string): Team {
    this.founded = founded;
    return this;
  }

  getFounded(): string {
    return this.founded;
  }

  setClubColors(clubColors: string): Team {
    this.clubColors = clubColors;
    return this;
  }

  getClubColors(): string {
    return this.clubColors;
  }

  setCoachName(coachName: string): Team {
    this.coachName = coachName;
    return this;
  }

  getCoachName(): string {
    return this.coachName;
  }

  setCompetitions(competitions: Competition[]): Team {
    this.competitions = competitions;
    return this;
  }

  getCompetitions(): Competition[] {
    return this.competitions;
  }

  setUsers(users: User[]): Team {
    this.users = users;
    return this;
  }

  getUsers(): User[] {
    return this.users;
  }
}
