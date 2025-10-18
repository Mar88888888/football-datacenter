import { Injectable, Logger } from '@nestjs/common';
import { FootballDataClient } from '../football-data/football-data.client';
import { Match } from '../matches/dto/match';

@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);

  constructor(private readonly dataService: FootballDataClient) {}

  async findById(compId: number) {
    return await this.dataService.getCompetitionById(compId);
  }

  async getMatches(compId: number): Promise<Match[]> {
    return this.dataService.getCompetitionMatches(compId);
  }
}
