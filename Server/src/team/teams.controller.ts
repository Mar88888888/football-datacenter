import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TeamService } from './teams.service';
import { Match } from '../matches/dto/match';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamService: TeamService) {}

  @Get('/:id')
  getTeamById(@Param('id', ParseIntPipe) teamId: number) {
    return this.teamService.getById(teamId);
  }

  @Get('/:id/matches')
  async getCompetitionMatches(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Match[]> {
    return await this.teamService.getMatches(id);
  }
}
