import { Controller, Get, Param } from '@nestjs/common';
import { CompetitionService } from './competition.service';

@Controller('competition')
export class CompetitionController {
  constructor(
    private readonly competitionService: CompetitionService,
  ){}


  @Get('/search/:name')
  searchCompsByName(@Param('name') name: string) {
    return this.competitionService.searchByName(name);
  }
  
  @Get('/:id')
  getCompetitionById(@Param('id') id: string){
    return this.competitionService.findById(parseInt(id));
  }
  

}
