import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
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
}
