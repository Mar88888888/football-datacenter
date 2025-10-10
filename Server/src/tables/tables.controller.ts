import {
  Controller,
  Get,
  Query,
  Param,
  Inject,
  ParseIntPipe,
} from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private tableService: TablesService) {}

  @Get('/:id')
  async getLeagueTable(@Param('id') leagueid: string) {
    return await this.tableService.getLeagueTable(parseInt(leagueid));
  }
}
