export interface IMatchesService {
  getMatches(date?: Date): Promise<any[]>;
  getUserMatches(userId: number): Promise<any>;
  getLiveMatches(): Promise<any>;
  getTeamMatches(teamId: number): Promise<{ last: any[]; next: any[] }>;
  getCompMatches(compId: number, limit?: string, prev?: boolean): Promise<any[]>;
}
