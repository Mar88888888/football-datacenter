import { Controller, Get, Query, Param, Inject } from '@nestjs/common';
import { ITablesService } from './tables.service.interface';

@Controller('tables')
export class TablesController {
  constructor(
    @Inject('ITablesService') private tableService: ITablesService,
  ){}
  
  @Get('/:id')
  async getLeagueTable(@Param('id') leagueid: string){
    return await this.tableService.getLeagueTable(parseInt(leagueid));
  }
}
