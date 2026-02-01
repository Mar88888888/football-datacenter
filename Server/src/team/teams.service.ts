import { Injectable, Logger } from '@nestjs/common';
import { Team } from './team';
import { FootballDataService, DataResult } from '../football-data/football-data.service';
import { Match } from '../matches/dto/match';
import { DataStatus } from '../common/constants';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private dataService: FootballDataService) {}

  async getById(id: number): Promise<DataResult<Team>> {
    const [teamResult, competitionsResult] = await Promise.all([
      this.dataService.getTeam(id),
      this.dataService.getAvailableCompetitions(),
    ]);

    // If any data is still processing, return processing with max retryAfter
    if (teamResult.status === DataStatus.PROCESSING || competitionsResult.status === DataStatus.PROCESSING) {
      const retryAfter = Math.max(
        teamResult.retryAfter ?? 0,
        competitionsResult.retryAfter ?? 0,
      ) || undefined;
      return { data: null, status: DataStatus.PROCESSING, retryAfter };
    }

    const team = teamResult.data!;
    const availableIds = new Set(competitionsResult.data!.map((c) => c.id));

    // Filter runningCompetitions to only include available ones
    if (team.runningCompetitions) {
      team.runningCompetitions = team.runningCompetitions.filter((comp) =>
        availableIds.has(comp.id),
      );
    }

    // Return stale if any source was stale
    const status = teamResult.status === DataStatus.STALE || competitionsResult.status === DataStatus.STALE
      ? DataStatus.STALE
      : DataStatus.FRESH;

    return { data: team, status };
  }

  async getMatches(teamId: number): Promise<DataResult<Match[]>> {
    const [matchesResult, competitionsResult] = await Promise.all([
      this.dataService.getTeamMatches(teamId),
      this.dataService.getAvailableCompetitions(),
    ]);

    // If any data is still processing, return processing with max retryAfter
    if (matchesResult.status === DataStatus.PROCESSING || competitionsResult.status === DataStatus.PROCESSING) {
      const retryAfter = Math.max(
        matchesResult.retryAfter ?? 0,
        competitionsResult.retryAfter ?? 0,
      ) || undefined;
      return { data: null, status: DataStatus.PROCESSING, retryAfter };
    }

    const availableIds = new Set(competitionsResult.data!.map((c) => c.id));
    const filteredMatches = matchesResult.data!.filter((match) =>
      availableIds.has(match.competition?.id),
    );

    const status = matchesResult.status === DataStatus.STALE || competitionsResult.status === DataStatus.STALE
      ? DataStatus.STALE
      : DataStatus.FRESH;

    return { data: filteredMatches, status };
  }
}
