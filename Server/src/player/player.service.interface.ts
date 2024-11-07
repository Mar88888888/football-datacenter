import { Player } from "./player";

export interface IPlayerService {
  getTeamPlayers(teamId: number): Promise<any[]>;
  getPlayerById(id: number): Promise<Player>;
}
