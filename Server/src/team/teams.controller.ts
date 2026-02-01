import { Controller, Get, Param, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { TeamService } from './teams.service';
import { ProcessingInterceptor } from '../interceptors/processing.interceptor';

@Controller('teams')
@UseInterceptors(ProcessingInterceptor)
export class TeamsController {
  constructor(private readonly teamService: TeamService) {}

  @Get('/:id')
  async getTeamById(@Param('id', ParseIntPipe) teamId: number) {
    return this.teamService.getById(teamId);
  }

  @Get('/:id/matches')
  async getTeamMatches(@Param('id', ParseIntPipe) id: number) {
    return this.teamService.getMatches(id);
  }
}
