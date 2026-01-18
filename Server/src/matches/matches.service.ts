import { Injectable, Logger } from '@nestjs/common';
import { FootballDataService, DataResult } from '../football-data/football-data.service';
import { Match } from './dto/match';
import { GetMatchesQueryDto } from './dto/getMatchesQuery.dto';

@Injectable()
export class MatchesService {
  constructor(private dataService: FootballDataService) {}

  private readonly logger = new Logger(MatchesService.name);

  async getMatches(query: GetMatchesQueryDto): Promise<DataResult<Match[]>> {
    const { date, limit, offset } = query;

    const dateToFetch = date ? new Date(date) : undefined;

    const [matchesResult, competitionsResult] = await Promise.all([
      this.dataService.getMatches(dateToFetch),
      this.dataService.getAvailableCompetitions(),
    ]);

    // If any data is still processing, return processing with max retryAfter
    if (matchesResult.status === 'processing' || competitionsResult.status === 'processing') {
      const retryAfter = Math.max(
        matchesResult.retryAfter ?? 0,
        competitionsResult.retryAfter ?? 0,
      ) || undefined;
      return { data: null, status: 'processing', retryAfter };
    }

    const availableCompetitionIds = new Set(
      competitionsResult.data!.map((c) => c.id),
    );

    let filteredMatches = matchesResult.data!.filter((match) =>
      availableCompetitionIds.has(match.competition?.id),
    );

    if (limit) {
      const startIndex = offset || 0;
      const endIndex = startIndex + limit;
      filteredMatches = filteredMatches.slice(startIndex, endIndex);
    }

    const status = matchesResult.status === 'stale' || competitionsResult.status === 'stale'
      ? 'stale'
      : 'fresh';

    return { data: filteredMatches, status };
  }
}
