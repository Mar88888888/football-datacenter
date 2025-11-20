import { Injectable, Logger } from '@nestjs/common';
import { FootballDataClient } from '../football-data/football-data.client';
import { Match } from '../matches/dto/match';

@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);

  constructor(private readonly dataClient: FootballDataClient) {}

  async findById(compId: number) {
    return await this.dataClient.getCompetitionById(compId);
  }

  async getMatches(compId: number): Promise<Match[]> {
    return this.dataClient.getCompetitionMatches(compId);
  }
}
