import { Injectable } from '@nestjs/common';
import { FootballDataService, DataResult } from '../football-data/football-data.service';
import { Standings } from './standings';

@Injectable()
export class StandingsService {
  constructor(private readonly dataService: FootballDataService) {}

  async getCompetitionStandings(competitionId: number): Promise<DataResult<Standings>> {
    return await this.dataService.getCompetitionStandings(competitionId);
  }
}
