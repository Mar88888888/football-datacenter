import { Controller, Get, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { GetMatchesQueryDto } from './dto/getMatchesQuery.dto';
import { Match } from './match';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async getMatches(@Query() query: GetMatchesQueryDto): Promise<Match[]> {
    const { date, limit } = query;
    let matches = date
      ? await this.matchesService.getMatches(new Date(date))
      : await this.matchesService.getMatches();

    if (limit) {
      let matchesLimited = matches.slice(0, limit);
      return matchesLimited;
    }
    return matches;
  }
}
