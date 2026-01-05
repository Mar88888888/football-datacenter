import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { Competition } from './competition';
import { Match } from '../matches/dto/match';

@Controller('competitions')
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  @Get()
  async getAllCompetitions(): Promise<Competition[]> {
    return await this.competitionService.findAll();
  }

  @Get('/:id/matches')
  async getCompetitionMatches(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Match[]> {
    return await this.competitionService.getMatches(id);
  }

  @Get('/:id')
  async getCompetitionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Competition> {
    return await this.competitionService.findById(id);
  }
}
