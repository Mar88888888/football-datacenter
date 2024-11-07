import { Controller, Get, Inject, Param } from '@nestjs/common';
import { IPlayerService } from './player.service.interface';

@Controller('players')
export class PlayerController {
  constructor(    
    @Inject('IPlayerService') private readonly playerService: IPlayerService
){}
  @Get('/fromteam/:teamid')
  async getTeamPlayers(@Param('teamid') teamId: string){
    return await this.playerService.getTeamPlayers(parseInt(teamId));
  }

  @Get('/:id')
  async getPlayerById(@Param('id') id: string){
    return await this.playerService.getPlayerById(parseInt(id));
  }
}
