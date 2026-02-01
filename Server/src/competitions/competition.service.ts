import { Injectable, Logger } from '@nestjs/common';
import { FootballDataService, DataResult } from '../football-data/football-data.service';
import { Match } from '../matches/dto/match';
import { Competition } from './competition';

@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);

  constructor(private readonly dataService: FootballDataService) {}

  async findAll(): Promise<DataResult<Competition[]>> {
    return await this.dataService.getAvailableCompetitions();
  }

  async findById(compId: number): Promise<DataResult<Competition>> {
    return await this.dataService.getCompetition(compId);
  }

  async getMatches(compId: number): Promise<DataResult<Match[]>> {
    return await this.dataService.getCompetitionMatches(compId);
  }
}
