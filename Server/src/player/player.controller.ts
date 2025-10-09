import { Controller, Get, Inject, Param } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}
  @Get('/fromteam/:teamid')
  async getTeamPlayers(@Param('teamid') teamId: string) {
    return await this.playerService.getTeamPlayers(parseInt(teamId));
  }

  @Get('/:id')
  async getPlayerById(@Param('id') id: string) {
    return await this.playerService.getPlayerById(parseInt(id));
  }
}
