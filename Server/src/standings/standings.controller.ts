import { Controller, Get, Param, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { StandingsService } from './standings.service';
import { ProcessingInterceptor } from '../interceptors/processing.interceptor';

@Controller('standings')
@UseInterceptors(ProcessingInterceptor)
export class StandingsController {
  constructor(private standingsService: StandingsService) {}

  @Get('/:competitionId')
  async getLeagueTable(@Param('competitionId', ParseIntPipe) competitionId: number) {
    return this.standingsService.getCompetitionStandings(competitionId);
  }
}
