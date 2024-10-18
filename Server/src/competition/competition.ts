import { Team } from '../team/team';
import { User } from '../users/user.entity';

export class Competition {
  private id: number;
  private name: string;
  private emblem: string;
  private teams: Team[];
  private users: User[];

  setId(id: number): Competition {
    this.id = id;
    return this;
  }

  getId(): number {
    return this.id;
  }

  setName(name: string): Competition {
    this.name = name;
    return this;
  }

  getName(): string {
    return this.name;
  }

  setEmblem(emblem: string): Competition {
    this.emblem = emblem;
    return this;
  }

  getEmblem(): string {
    return this.emblem;
  }

  setTeams(teams: Team[]): Competition {
    this.teams = teams;
    return this;
  }

  getTeams(): Team[] {
    return this.teams;
  }

  setUsers(users: User[]): Competition {
    this.users = users;
    return this;
  }

  getUsers(): User[] {
    return this.users;
  }
}
