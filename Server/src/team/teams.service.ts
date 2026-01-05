import { Injectable, Logger } from '@nestjs/common';
import { Team } from './team';
import { FootballDataClient } from '../football-data/football-data.client';
import { Match } from '../matches/dto/match';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private dataClient: FootballDataClient) {}

  private async getAvailableCompetitionIds(): Promise<Set<number>> {
    const competitions = await this.dataClient.getAvailableCompetitions();
    return new Set(competitions.map((c) => c.id));
  }

  async getById(id: number): Promise<Team> {
    const [team, availableIds] = await Promise.all([
      this.dataClient.getTeamById(id),
      this.getAvailableCompetitionIds(),
    ]);

    // Filter runningCompetitions to only include available ones
    if (team.runningCompetitions) {
      team.runningCompetitions = team.runningCompetitions.filter((comp) =>
        availableIds.has(comp.id),
      );
    }

    return team;
  }

  async getMatches(teamId: number): Promise<Match[]> {
    const [matches, availableIds] = await Promise.all([
      this.dataClient.getTeamMatches(teamId),
      this.getAvailableCompetitionIds(),
    ]);

    return matches.filter((match) =>
      availableIds.has(match.competition?.id),
    );
  }
}
