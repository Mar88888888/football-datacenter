import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Competition } from './competition';
import axios from 'axios';
import { FootballDataService } from '../football-data/football-data.service';

@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);

  constructor(private readonly footballDataService: FootballDataService) {}

  async findById(compId: number) {
    try {
      let competitionUrl = `competitions/${compId}`;
      const teamResponse = await this.footballDataService.get(competitionUrl);
      const fetchedComp = teamResponse;

      let competition = new Competition();
      competition.id = compId;
      competition.name = fetchedComp.name;
      competition.emblem = fetchedComp.emblem;
      competition.type = fetchedComp.type;

      return competition;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NotFoundException(`Competition with id ${compId} not found`);
      }
    }
  }
}
