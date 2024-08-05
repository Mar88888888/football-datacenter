import { Module } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { CompetitionController } from './competition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Competition } from './competition.entity';
import { GlobalRequestCounterService } from '../global-request-counter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Competition]),
    HttpModule,
  ],
  providers: [CompetitionService, GlobalRequestCounterService],
  controllers: [CompetitionController],
  exports: [CompetitionService]
})
export class CompetitionModule {}
