import { Controller, Get, Param } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { Competition } from './competition';

@Controller('competitions')
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  @Get('/:id')
  async getCompetitionById(@Param('id') id: string): Promise<Competition> {
    return await this.competitionService.findById(parseInt(id));
  }
}
