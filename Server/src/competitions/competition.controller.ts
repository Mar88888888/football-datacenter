import { Controller, Get, Param, ParseIntPipe, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CompetitionService } from './competition.service';

@Controller('competitions')
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  @Get()
  async getAllCompetitions(@Res() res: Response): Promise<void> {
    const result = await this.competitionService.findAll();

    if (result.status === 'processing') {
      res.setHeader('Retry-After', String(result.retryAfter ?? 5));
      res.status(HttpStatus.ACCEPTED).json({ status: 'processing' });
      return;
    }

    res.status(HttpStatus.OK).json(result.data);
  }

  @Get('/:id/matches')
  async getCompetitionMatches(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.competitionService.getMatches(id);

    if (result.status === 'processing') {
      res.setHeader('Retry-After', String(result.retryAfter ?? 5));
      res.status(HttpStatus.ACCEPTED).json({ status: 'processing' });
      return;
    }

    res.status(HttpStatus.OK).json(result.data);
  }

  @Get('/:id')
  async getCompetitionById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.competitionService.findById(id);

    if (result.status === 'processing') {
      res.setHeader('Retry-After', String(result.retryAfter ?? 5));
      res.status(HttpStatus.ACCEPTED).json({ status: 'processing' });
      return;
    }

    res.status(HttpStatus.OK).json(result.data);
  }
}
