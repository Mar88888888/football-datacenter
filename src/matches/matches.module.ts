import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { GlobalRequestCounterService } from '../global-request-counter.service';

@Module({
  imports: [HttpModule],
  providers: [MatchesService, GlobalRequestCounterService],
  controllers: [MatchesController],
  exports: [MatchesService]
})
export class MatchesModule {}
