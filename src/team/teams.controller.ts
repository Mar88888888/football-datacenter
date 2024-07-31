import { Controller, Get, Param } from '@nestjs/common';
import { TeamService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamService: TeamService){}
  @Get('')
  getAllTeams(){
    return this.teamService.getAllTeams();
  }

  @Get('/search/:name')
  searchTeamsByName(@Param('name') name: string) {
    return this.teamService.searchByName(name);
  }

  @Get('/:id')
  getTeamById(@Param('id') id: string){
    return this.teamService.findOne(parseInt(id));
  }

}
