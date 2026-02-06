import { Controller, Get, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { GetMatchesQueryDto } from './dto/getMatchesQuery.dto';
import { ProcessingInterceptor } from '../interceptors/processing.interceptor';

@Controller('matches')
@UseInterceptors(ProcessingInterceptor)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async getMatches(@Query() query: GetMatchesQueryDto) {
    return this.matchesService.getMatches(query);
  }

  @Get('/:id')
  async getMatch(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.getMatch(id);
  }

  @Get('/:id/head2head')
  async getHead2Head(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.getHead2Head(id);
  }
}
