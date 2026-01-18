import { Controller, Get, Param, ParseIntPipe, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Standings } from './standings';
import { StandingsService } from './standings.service';

@Controller('standings')
export class StandingsController {
  constructor(private standingsService: StandingsService) {}

  @Get('/:competitionId')
  async getLeagueTable(
    @Param('competitionId', ParseIntPipe) competitionId: number,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.standingsService.getCompetitionStandings(competitionId);

    if (result.status === 'processing') {
      res.setHeader('Retry-After', String(result.retryAfter ?? 5));
      res.status(HttpStatus.ACCEPTED).json({ status: 'processing' });
      return;
    }

    res.status(HttpStatus.OK).json(result.data);
  }
}
