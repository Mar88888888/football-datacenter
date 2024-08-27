import { Controller, Get, Param, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async getMatches(@Query('date') date?: string, @Query('limit') limit?: string) {
    let matches = (date) ? await this.matchesService.getMatches(new Date(date)) 
    : await this.matchesService.getMatches();
    let limitSet = parseInt(limit);
    if(!isNaN(limitSet)){
      let matchesLimited = matches.slice(0, limitSet);
      return matchesLimited;
    }
    return matches;
  }

  @Get('/live')
  async getLiveMatches() {
    return await this.matchesService.getLiveMatches();
  }

  @Get('/forteam/:teamid')
  async getTeamMatches(@Param('teamid') teamid: string, @Query('date') date?: string, @Query('dateTo') dateTo?: string, @Query('status') status?: string, @Query('limit') limit?: string,) {
    let from: Date;
    if(date){
      from = new Date(date);
    }
    return await this.matchesService.getTeamMatches(parseInt(teamid));
  }

  @Get('/forcomp/:compid')
  async getCompMatches(@Param('compid') compid: string, @Query('limit') limit?: string,  @Query('prev') prev?: string,) {
    return await this.matchesService.getCompMatches(parseInt(compid), limit ? limit: undefined, prev ? prev == 'true' : undefined);
  }
}
