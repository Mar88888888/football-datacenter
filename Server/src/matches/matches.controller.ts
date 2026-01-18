import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { MatchesService } from './matches.service';
import { GetMatchesQueryDto } from './dto/getMatchesQuery.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async getMatches(
    @Query() query: GetMatchesQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.matchesService.getMatches(query);

    if (result.status === 'processing') {
      res.setHeader('Retry-After', String(result.retryAfter ?? 5));
      res.status(HttpStatus.ACCEPTED).json({ status: 'processing' });
      return;
    }

    res.status(HttpStatus.OK).json(result.data);
  }
}
