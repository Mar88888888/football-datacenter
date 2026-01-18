import { Controller, Get, Param, ParseIntPipe, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { TeamService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamService: TeamService) {}

  @Get('/:id')
  async getTeamById(
    @Param('id', ParseIntPipe) teamId: number,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.teamService.getById(teamId);

    if (result.status === 'processing') {
      res.setHeader('Retry-After', String(result.retryAfter ?? 5));
      res.status(HttpStatus.ACCEPTED).json({ status: 'processing' });
      return;
    }

    res.status(HttpStatus.OK).json(result.data);
  }

  @Get('/:id/matches')
  async getTeamMatches(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.teamService.getMatches(id);

    if (result.status === 'processing') {
      res.setHeader('Retry-After', String(result.retryAfter ?? 5));
      res.status(HttpStatus.ACCEPTED).json({ status: 'processing' });
      return;
    }

    res.status(HttpStatus.OK).json(result.data);
  }
}
