import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ICompetitionService } from './competition.service.interface';

@Controller('competition')
export class CompetitionController {
  constructor(
    @Inject('ICompetitionService') private readonly competitionService: ICompetitionService,
  ){}


  @Get('/search/:name')
  searchCompsByName(@Param('name') name: string) {
    return this.competitionService.searchByName(name);
  }

  @Get('/top')
  getTopLeagues(){
    return this.competitionService.getTopLeagues();
  }
  
  @Get('/:id')
  getCompetitionById(@Param('id') id: string){
    return this.competitionService.findById(parseInt(id));
  }
}
