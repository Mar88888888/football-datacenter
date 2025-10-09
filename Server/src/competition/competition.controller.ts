import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { Competition } from './competition';

@Controller('competitions')
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  @Get('/:id')
  async getCompetitionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Competition> {
    return await this.competitionService.findById(id);
  }
}
