import { Injectable, Logger } from '@nestjs/common';
import { FootballDataClient } from '../football-data/football-data.client';
import { Match } from './dto/match';
import { GetMatchesQueryDto } from './dto/getMatchesQuery.dto';

@Injectable()
export class MatchesService {
  constructor(private dataClient: FootballDataClient) {}

  private readonly logger = new Logger(MatchesService.name);

  async getMatches(query: GetMatchesQueryDto): Promise<Match[]> {
    const { date, limit, offset } = query;

    const dateToFetch = date ? new Date(date) : undefined;

    const matches = await this.dataClient.getMatches(dateToFetch);

    if (limit) {
      const startIndex = offset || 0;
      const endIndex = startIndex + limit;
      return matches.slice(startIndex, endIndex);
    }

    return matches;
  }
}
