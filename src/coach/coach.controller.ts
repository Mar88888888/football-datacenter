import { Controller, Get, Param } from '@nestjs/common';
import { CoachService } from './coach.service';

@Controller('coach')
export class CoachController {
  constructor(
    private readonly coachService: CoachService
  ){}

  @Get('')
  async getAllCoaches(){
    return await this.coachService.getAll();
  }

  @Get('/:id')
  getCoachById(@Param('id') id: string){
    return this.coachService.findOne(parseInt(id));
  }
  
  @Get('/fromteam/:id')
  getCoachByTeamId(@Param('id') teamId: string){
    return this.coachService.getFromTeam(parseInt(teamId));
  }
  
}
