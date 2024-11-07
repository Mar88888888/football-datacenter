import { Competition } from "./competition";

export interface ICompetitionService {
  findById(compId: number): Promise<Competition>;
  getTopLeagues(region?: string): Promise<Competition[]>;
  searchByName(name: string): Promise<Competition[]>;
}
