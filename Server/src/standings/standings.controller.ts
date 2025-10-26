import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Standings } from './standings';
import { StandingsService } from './standings.service';

@Controller('standings')
export class StandingsController {
  constructor(private standingsService: StandingsService) {}

  @Get('/:competitionId')
  async getLeagueTable(
    @Param('competitionId', ParseIntPipe) competitionId: number,
  ): Promise<Standings> {
    return await this.standingsService.getCompetitionStandings(competitionId);
  }
}
