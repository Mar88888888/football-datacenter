export interface IFavouriteService {
  getFavTeams(userId: number): Promise<any[]>;
  getFavComps(userId: number): Promise<any[]>;
  addFavTeam(userId: number, teamId: number): Promise<void>;
  addFavComp(userId: number, compId: number): Promise<void>;
  removeFavTeam(userId: number, teamId: number): Promise<void>;
  removeFavComp(userId: number, compId: number): Promise<void>;
}
