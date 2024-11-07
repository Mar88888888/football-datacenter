import { Team } from "./team";

export interface ITeamService {
  findById(teamId: number): Promise<Team>;
  searchByName(name: string): Promise<Team[]>;
}
