import { Injectable, Logger } from '@nestjs/common';
import { Team } from './team';
import { FootballDataClient } from '../football-data/football-data.client';
import { Match } from '../matches/dto/match';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private dataClient: FootballDataClient) {}

  async getById(id: number): Promise<Team> {
    return this.dataClient.getTeamById(id);
  }

  async getMatches(teamId: number): Promise<Match[]> {
    return this.dataClient.getTeamMatches(teamId);
  }
}
