import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TeamService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamService: TeamService) {}

  @Get('/:id')
  getTeamById(@Param('id', ParseIntPipe) teamId: number) {
    return this.teamService.getById(teamId);
  }
}
