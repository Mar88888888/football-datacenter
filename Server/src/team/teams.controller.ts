import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { ITeamService } from './teams.service.interface';

@Controller('teams')
export class TeamsController {
  constructor(
    @Inject('ITeamService') private readonly teamService: ITeamService
  ){}

  @Get('/search/:name')
  searchTeamsByName(@Param('name') name: string) {
    return this.teamService.searchByName(name);
  }

  @Get('/:id')
  getTeamById(@Param('id') id: string){
      return this.teamService.findById(parseInt(id));
  }

}
