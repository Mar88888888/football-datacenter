export interface ITablesService {
  getLeagueTable(tournamentId: number): Promise<any[]>;
}
