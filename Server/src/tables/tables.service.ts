import { Injectable } from '@nestjs/common';
import { FootballDataClient } from '../football-data/football-data.client';
import { Standings } from './standings';

@Injectable()
export class StandingsService {
  constructor(private readonly dataClient: FootballDataClient) {}

  async getCompetitionStandings(competitionId: number): Promise<Standings> {
    return await this.dataClient.getCompetitionStandings(competitionId);
  }
}
