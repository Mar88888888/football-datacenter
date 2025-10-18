import { Controller, Get, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { GetMatchesQueryDto } from './dto/getMatchesQuery.dto';
import { Match } from './dto/match';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async getMatches(@Query() query: GetMatchesQueryDto): Promise<Match[]> {
    return await this.matchesService.getMatches(query);
  }
}
