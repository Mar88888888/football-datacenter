import { Controller, Get, Param, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async getMatches(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    console.log(dateFrom, dateTo);
    return await this.matchesService.getMatches(new Date(dateFrom), new Date(dateTo));
  }

  @Get('/live')
  async getLiveMatches() {
    return await this.matchesService.getLiveMatches();
  }

  @Get('/forteam/:teamid')
  async getTeamMatches(@Param('teamid') teamid: string, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string, @Query('status') status?: string, @Query('limit') limit?: string,) {
    let from: Date, to: Date;
    if(dateFrom && dateTo){
      from = new Date(dateFrom);
      to = new Date(dateTo);
    }
    return await this.matchesService.getTeamMatches(parseInt(teamid), from, to, status, limit);
  }
}
