import { Controller, Get, Query } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private tableService: TablesService){}
  
  @Get('/')
  async getLeagueTable(@Query('league') league: string){
    return await this.tableService.getLeagueTable(league);
  }
}
