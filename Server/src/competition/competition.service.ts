import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Competition } from './competition';
import axios from 'axios';

@Injectable()
export class CompetitionService {
  private readonly logger = new Logger(CompetitionService.name);

  constructor() {}

  async findById(compId: number) {
    try {
      let competitionUrl = `https://api.football-data.org/v4/competitions/${compId}`;
      const teamResponse = await axios.get<Competition>(competitionUrl, {
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_API_TOKEN,
        },
      });
      const fetchedComp = teamResponse.data;

      let competition = new Competition();
      competition.id = compId;
      competition.name = fetchedComp.name;
      competition.emblem = fetchedComp.emblem;
      competition.type = fetchedComp.type;

      return competition;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException(`Competition with id ${compId} not found`);
      }
      throw error;
    }
  }
}
