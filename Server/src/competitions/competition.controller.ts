import { Controller, Get, Param, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { ProcessingInterceptor } from '../interceptors/processing.interceptor';

@Controller('competitions')
@UseInterceptors(ProcessingInterceptor)
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  @Get()
  async getAllCompetitions() {
    return this.competitionService.findAll();
  }

  @Get('/:id/matches')
  async getCompetitionMatches(@Param('id', ParseIntPipe) id: number) {
    return this.competitionService.getMatches(id);
  }

  @Get('/:id/scorers')
  async getCompetitionScorers(@Param('id', ParseIntPipe) id: number) {
    return this.competitionService.getScorers(id);
  }

  @Get('/:id')
  async getCompetitionById(@Param('id', ParseIntPipe) id: number) {
    return this.competitionService.findById(id);
  }
}
